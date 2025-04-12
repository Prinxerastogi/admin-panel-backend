const refundSchema = require("../../sharedmb/schema/refund");
const walletTransaction = require("../../sharedmb/schema/walletTransaction");
const userSchema = require("../../sharedmb/schema/user");
const { Types } = require("mongoose");
const axios = require("axios");
const config = require("config");

const updateRefundStatus = async (req, res) => {
    try {
        const { refundId } = req.params;
        let { status, adminId } = req.body;

        // Standardize status
        if (status === "accept") status = "accepted";
        if (status === "reject") status = "rejected";

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'accepted' or 'rejected'",
            });
        }

        // Find refund with populated order
        const refund = await refundSchema
            .findOne({ id: Number(refundId) })
            .populate({
                path: "orderId",
                select: "userId id easeBuzzResponse paymentMode",
            });

        if (!refund) {
            return res.status(404).json({
                success: false,
                message: "Refund not found",
            });
        }

        if (refund.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Refund is already ${refund.status}`,
            });
        }

        // Update refund status
        const updateData = {
            status,
            [`${status}edBy`]: adminId,
            [`${status}edAt`]: new Date(),
        };

        await refundSchema.updateOne(
            { id: Number(refundId) },
            { $set: updateData }
        );

        // If accepted, process refunds based on payment split
        if (status === "accepted") {
            const { amountSplit } = refund;

            // Process wallet refund if exists
            if (amountSplit.wallet && amountSplit.wallet > 0) {
                // Create wallet transaction
                const walletTrans = await walletTransaction.create({
                    userId: refund.orderId.userId,
                    type: "credit",
                    status: "success",
                    amount: amountSplit.wallet,
                    created: new Date(),
                    updated: new Date(),
                    date: new Date(),
                    message: `Refund for order #${refund.orderId.id}`,
                    refundId: refund._id,
                });

                if (!walletTrans) {
                    console.error("Failed to create wallet transaction");
                    return res.status(500).json({
                        success: false,
                        message: "Failed to process wallet refund",
                    });
                }

                // Update user's wallet balance
                const user = await userSchema.findOneAndUpdate(
                    { _id: Types.ObjectId(refund.orderId.userId) },
                    { $inc: { walletBalance: amountSplit.wallet } },
                    { new: true, projection: { walletBalance: 1 } }
                );

                if (!user) {
                    console.error("Failed to update user wallet balance");
                    return res.status(500).json({
                        success: false,
                        message: "Failed to update user wallet balance",
                    });
                }
            }

            // Process online payment refund if exists
            if (amountSplit.online && amountSplit.online > 0) {
                try {
                    // Get Easebuzz configuration
                    const easebuzzKey = config.get("easebuzz.key");
                    const easebuzzSalt = config.get("easebuzz.salt");
                    const easebuzzEnv = config.get("easebuzz.env");

                    // Prepare refund request data
                    const refundData = {
                        txnid: refund.orderId.easeBuzzResponse.txnid,
                        refund_amount: amountSplit.online.toString(),
                        refund_amt: amountSplit.online.toString(),
                        refund_note: `Refund for order #${refund.orderId.id}`,
                        refund_bank_note: `Refund for order #${refund.orderId.id}`,
                        refund_through: "admin",
                        refund_partial: "true",
                        refund_reason: "Customer requested refund",
                        refund_status: "initiated",
                    };

                    // Generate hash for Easebuzz
                    const hashString = `${easebuzzKey}|${refundData.txnid}|${refundData.refund_amount}|${refundData.refund_amt}|${refundData.refund_note}|${refundData.refund_bank_note}|${refundData.refund_through}|${refundData.refund_partial}|${refundData.refund_reason}|${refundData.refund_status}|${easebuzzSalt}`;
                    const hash = require("crypto")
                        .createHash("sha512")
                        .update(hashString)
                        .digest("hex");
                    refundData.hash = hash;

                    // Make API call to Easebuzz
                    const easebuzzUrl =
                        easebuzzEnv === "test"
                            ? "https://testpay.easebuzz.in/transaction/v1/refund"
                            : "https://pay.easebuzz.in/transaction/v1/refund";

                    const response = await axios.post(easebuzzUrl, refundData);

                    // Check response status and error codes
                    if (response.data.status !== 1) {
                        console.error("Easebuzz refund failed:", response.data);

                        // Handle specific error cases
                        if (response.data.error_code === "TXN_001") {
                            return res.status(400).json({
                                success: false,
                                message: "Invalid transaction ID",
                                error: response.data.error_Message,
                            });
                        } else if (response.data.error_code === "TXN_002") {
                            return res.status(400).json({
                                success: false,
                                message: "Transaction already refunded",
                                error: response.data.error_Message,
                            });
                        } else if (response.data.error_code === "TXN_003") {
                            return res.status(400).json({
                                success: false,
                                message:
                                    "Refund amount exceeds transaction amount",
                                error: response.data.error_Message,
                            });
                        }

                        return res.status(500).json({
                            success: false,
                            message: "Failed to process online refund",
                            error: response.data.error_Message,
                        });
                    }

                    // Update refund record with Easebuzz response
                    await refundSchema.updateOne(
                        { id: Number(refundId) },
                        {
                            $set: {
                                easebuzzRefundResponse: response.data,
                                easebuzzRefundStatus:
                                    response.data.refund_status,
                                easebuzzRefundId: response.data.refund_id,
                                easebuzzRefundAmount:
                                    response.data.refund_amount,
                                easebuzzRefundDate: response.data.refund_date,
                            },
                        }
                    );

                    // Log successful refund
                    console.log(
                        `Easebuzz refund successful for order #${refund.orderId.id}`,
                        {
                            refundId: response.data.refund_id,
                            amount: response.data.refund_amount,
                            status: response.data.refund_status,
                        }
                    );
                } catch (error) {
                    console.error("Error processing Easebuzz refund:", error);

                    // Handle network errors
                    if (error.code === "ECONNREFUSED") {
                        return res.status(503).json({
                            success: false,
                            message: "Payment gateway service unavailable",
                            error: "Connection refused",
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message: "Error processing online refund",
                        error: error.message,
                    });
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: `Refund ${status} successfully`,
        });
    } catch (error) {
        console.error("Error in updateRefundStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating refund status",
            error: error.message,
        });
    }
};

module.exports = updateRefundStatus;
