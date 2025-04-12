const refundSchema = require("../../sharedmb/schema/refund");
const orderSchema = require("../../sharedmb/schema/order");
const userSchema = require("../../sharedmb/schema/user");
const walletTransaction = require("../../sharedmb/schema/walletTransaction");
const Crypto = require("crypto");
const { default: Axios } = require("axios");

const checkRequest = async (req, res, next) => {
    try {
        const { refundRequestId } = req.body;
        req.data = {};

        if (!refundRequestId) {
            return res.status(400).json({
                success: false,
                message: "Refund request ID is required",
            });
        }

        const refund = await refundSchema.findOneAndUpdate(
            {
                id: refundRequestId,
                status: "pending",
            },
            {
                $set: {
                    status: "accepted",
                },
            }
        );

        if (!refund) {
            return res.status(201).json({
                success: false,
                message: "Refund request not found or already accepted",
            });
        }
        const order = await orderSchema.findOne({
            _id: refund.orderId,
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        req.data.refund = refund;
        req.data.order = order;
        next();
    } catch (error) {
        console.error("Error in checkRequest", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const processRefund = async (req, res, next) => {
    try {
        const refund = req.data.refund;
        let walletResponse = false;
        let onlinRefund = false;
        let cashRefund = false;

        if (refund.amountSplit.wallet > 0) {
            walletResponse = await processWalletRefund(
                refund.amountSplit.wallet,
                req.data.order,
                refund._id
            );
        }
        if (refund.amountSplit.online > 0) {
            onlinRefund = await processEasebuzzRefund(
                refund.amountSplit.online,
                req.data.order,
                refund._id
            );
        }
        if (refund.amountSplit.cash > 0) {
            cashRefund = await processCodRefund(
                refund.amountSplit.cash,
                refund._id
            );
        }

        const allSucceeded =
            [walletResponse, onlinRefund, cashRefund].filter(Boolean).length ===
            [
                refund.amountSplit.wallet,
                refund.amountSplit.online,
                refund.amountSplit.cash,
            ].filter((v) => v > 0).length;

        if (!allSucceeded) {
            return res.status(500).json({
                success: false,
                message: "Some or all refund methods failed",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Refund processed successfully",
        });
    } catch (error) {
        console.error("Error in processRefund", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const processWalletRefund = async (amount, order, refundId) => {
    try {
        const transaction = await walletTransaction.create({
            orderId: order._id,
            userId: order.userId,
            sellerId: order.sellerId,
            refundId: refundId,
            status: "success",
            type: "credit",
            amount: amount,
            created: Date.now(),
            updated: Date.now(),
            date: new Date(),
            message: `refund for Order ${order.id}`,
        });

        if (!transaction) {
            throw new Error("Transaction creation failed");
        }

        const user = await userSchema.findOneAndUpdate(
            { _id: order.userId },
            {
                $inc: {
                    walletBalance: amount,
                },
            }
        );
        if (!user) {
            throw new Error("User not found");
        }

        const refund = await refundSchema.findOneAndUpdate(
            { _id: refundId },
            {
                $set: {
                    status: "success",
                    walletTransactionId: transaction._id,
                },
            }
        );
        if (!refund) {
            throw new Error("Refund update failed");
        }

        return true;
    } catch (error) {
        console.error("Error in processWalletRefund", error);
        return false;
    }
};

const processEasebuzzRefund = async (amount, order, refundId) => {
    try {
        if (
            !order.easeBuzzResponse ||
            order.easeBuzzResponse.status !== "success" ||
            !order.easeBuzzResponse.easepayid ||
            !order.paymentSource.easeBuzz ||
            order.paymentSource.easeBuzz < amount ||
            order.paymentSource.easeBuzz < 0
        ) {
            console.error("Invalid order data for Easebuzz refund");
            return false;
        }

        const toHash = `${process.env.key}|${refundId}|${order.easeBuzzResponse.easepayid}|${amount}|${process.env.salt}`;
        const hash = Crypto.createHash("sha512").update(toHash).digest("hex");

        const options = {
            method: "POST",
            url: "https://dashboard.easebuzz.in/transaction/v2/refund",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            data: {
                key: process.env.key,
                merchant_refund_id: refundId,
                easebuzz_id: order.easeBuzzResponse.easepayid,
                refund_amount: amount,
                hash: hash,
            },
        };

        const { data } = await Axios.request(options);

        if (!data.status) {
            console.error("Easebuzz refund failed", data);
            return false;
        }

        const refund = await refundSchema.findOneAndUpdate(
            { _id: refundId },
            {
                $set: {
                    status: "success",
                    easebuzzResponse: data,
                },
            }
        );
        if (!refund) {
            console.error("Refund update failed");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error in processEasebuzzRefund", error);
        return false;
    }
};

const processCodRefund = async (amount, refundId) => {
    try {
        const refund = await refundSchema.findOneAndUpdate(
            { _id: refundId },
            {
                $set: {
                    status: "success",
                    cashRefundDone: true,
                },
            }
        );
        if (!refund) {
            throw new Error("Refund update failed");
        }
        return true;
    } catch (error) {
        console.error("Error in processCodRefund", error);
        return false;
    }
};

module.exports = [checkRequest, processRefund];
