const refundSchema = require("../../sharedmb/schema/refund");
const orderSchema = require("../../sharedmb/schema/order");
const userSchema = require("../../sharedmb/schema/user");
const walletTransaction = require("../../sharedmb/schema/walletTransaction");
const Crypto = require("crypto");
const { default: Axios } = require("axios");
const mongoose = require("mongoose");
const { errorlog, successlog } = require("../../sharedmb/utility/logger");

const checkRequest = async (req, res, next) => {
    try {
        if (!process.env.key || !process.env.salt) {
            throw new Error("Missing Easebuzz credentials");
        }

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
                    acceptedOn: new Date(),
                    rejectedOn: null,
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
        errorlog.error("Error in checkRequest", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const processRefund = async (req, res, next) => {
    try {
        const refund = req.data.refund;
        const order = req.data.order;
        let walletResponse = false;
        let onlineRefund = false;
        let cashRefund = false;

        // Prepare product updates
        const updates = {};
        const arrayFilters = [];

        refund.products.forEach((p, index) => {
            const productId = Object.keys(p)[0];
            const quantity = p[productId];

            // Convert productId to Number (since that's how it's stored in order)
            const numericProductId = Number(productId);

            // Add to array filters (using numeric comparison)
            arrayFilters.push({
                [`elem${index}.id`]: numericProductId, // Using 'id' field which contains the numeric product ID
            });

            // Set update for this product
            updates[`product.$[elem${index}].refundedQuantity`] = quantity;
        });

        // Update order with refunded quantities
        const updateResult = await orderSchema.findByIdAndUpdate(
            order._id,
            {
                $inc: {
                    ...updates,
                    totalRefundedAmount: refund.amount,
                },
            },
            {
                arrayFilters: arrayFilters,
                new: true,
                useFindAndModify: false,
            }
        );

        // Rest of your refund processing code...
        if (refund.amountSplit.wallet > 0) {
            successlog.info(
                "processing wallet refund" +
                    refund.amountSplit.wallet +
                    " " +
                    refund._id
            );
            walletResponse = await processWalletRefund(
                refund.amountSplit.wallet,
                req.data.order,
                refund._id
            );
        }
        if (refund.amountSplit.online > 0) {
            successlog.info(
                "processing online refund" +
                    refund.amountSplit.online +
                    " " +
                    refund._id
            );
            onlineRefund = await processEasebuzzRefund(
                refund.amountSplit.online,
                req.data.order,
                refund._id
            );
        }
        if (refund.amountSplit.cash > 0) {
            successlog.info(
                "processing cod refund" +
                    refund.amountSplit.online +
                    " " +
                    refund._id
            );
            cashRefund = await processCodRefund(
                refund.amountSplit.cash,
                refund._id
            );
        }

        const expectedMethods = Object.entries(refund.amountSplit).filter(
            ([, value]) => value > 0
        ).length;

        const successCount = [walletResponse, onlineRefund, cashRefund].filter(
            Boolean
        ).length;

        if (successCount !== expectedMethods) {
            errorlog.error("Some or all refund methods failed");
            return res.status(500).json({
                success: false,
                message: "Some or all refund methods failed",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Refund processed successfully",
            updatedOrder: updateResult,
        });
    } catch (error) {
        errorlog.error("Error in processRefund", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const processWalletRefund = async (amount, order, refundId) => {
    const session = await mongoose.startSession();

    try {
        let result = false;

        await session.withTransaction(async () => {
            // Step 1: Create wallet transaction
            const transaction = await walletTransaction.create(
                [
                    {
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
                    },
                ],
                { session }
            );
            if (!transaction?.[0])
                throw new Error("Wallet transaction creation failed");

            // Step 2: Update user's wallet balance
            const user = await userSchema.findOneAndUpdate(
                { _id: order.userId },
                { $inc: { walletBalance: amount } },
                { session }
            );
            if (!user) throw new Error("User not found");

            // Step 3: Final refund update
            const finalRefundUpdate = await refundSchema.findOneAndUpdate(
                {
                    _id: refundId,
                    "refundBreakdown.mode": "wallet",
                    "refundBreakdown.status": "pending",
                },
                {
                    $set: {
                        status: "success",
                        walletTransactionId: transaction[0]._id,
                        "refundBreakdown.$[elem].status": "success",
                    },
                },
                {
                    session,
                    arrayFilters: [
                        { "elem.mode": "wallet", "elem.status": "pending" },
                    ],
                }
            );
            if (!finalRefundUpdate)
                throw new Error("Final refund update failed");

            const orderUpdate = await orderSchema.findOneAndUpdate(
                {
                    _id: mongoose.Types.ObjectId(order._id),
                    isWalletRefunded: { $ne: true },
                },
                {
                    $set: {
                        isWalletRefunded: false,
                    },
                },
                {
                    session,
                }
            );

            if (!orderUpdate)
                throw new Error("Order wallet money already refunded");

            result = true;
        });

        return result;
    } catch (error) {
        errorlog.error("Error in processWalletRefund", error);
        return false;
    } finally {
        session.endSession();
    }
};

const processEasebuzzRefund = async (amount, order, refundId) => {
    try {
        const easebuzzData = order.easeBuzzResponse;
        const easebuzzAmount = parseFloat(order.paymentSource.easeBuzz);
        if (
            !easebuzzData ||
            easebuzzData.status !== "success" ||
            !easebuzzData.easepayid ||
            !easebuzzAmount ||
            easebuzzAmount < amount ||
            easebuzzAmount < 0
        ) {
            errorlog.error("Invalid order data for Easebuzz refund");
            return false;
        }

        const refundUpdate = await refundSchema.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(refundId),
                "refundBreakdown.mode": "online",
                "refundBreakdown.status": "pending",
            },
            {
                $set: {
                    "refundBreakdown.$[elem].status": "processing",
                },
            },
            {
                arrayFilters: [
                    { "elem.mode": "online", "elem.status": "pending" },
                ],
            }
        );

        if (!refundUpdate) {
            errorlog.error("unable to process easebuzz refund , cannot update");
            return false;
        }

        let response = null;
        if (easebuzzData.mode === "UPI" && easebuzzData.upi_va) {
            response = await processExpressRefund(
                easebuzzData,
                amount,
                order.id,
                refundId
            );
        } else {
            response = await processNormalRefund(
                refundId,
                easebuzzData.easepayid,
                amount
            );
        }

        successlog.info(response);

        if (response.success) {
            await refundSchema.updateOne(
                {
                    _id: mongoose.Types.ObjectId(refundId),
                    "refundBreakdown.mode": "online",
                    "refundBreakdown.status": "processing",
                },
                {
                    $set: {
                        "refundBreakdown.$[elem].status": "success",
                        status: "success",
                        easebuzzResponse: response.data || null,
                    },
                },
                {
                    arrayFilters: [
                        { "elem.mode": "online", "elem.status": "processing" },
                    ],
                }
            );
            return true;
        } else {
            await refundSchema.updateOne(
                {
                    _id: mongoose.Types.ObjectId(refundId),
                    "refundBreakdown.mode": "online",
                    "refundBreakdown.status": "processing",
                },
                {
                    $set: {
                        "refundBreakdown.$[elem].status": "failed",
                        easebuzzResponse: response.data,
                    },
                },
                {
                    arrayFilters: [
                        { "elem.mode": "online", "elem.status": "processing" },
                    ],
                }
            );
            return false;
        }
    } catch (error) {
        await refundSchema.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(refundId),
                "refundBreakdown.mode": "online",
                "refundBreakdown.status": "processing",
            },
            {
                $set: {
                    "refundBreakdown.$[elem].status": "failed",
                    easebuzzResponse: null,
                },
            },
            {
                arrayFilters: [
                    { "elem.mode": "online", "elem.status": "processing" },
                ],
            }
        );
        return false;
    }
};

const processNormalRefund = async (refundId, easepayid, amount) => {
    try {
        const toHash = `${process.env.key}|${refundId}|${easepayid}|${amount}|${process.env.salt}`;
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
                easebuzz_id: easepayid,
                refund_amount: amount,
                hash: hash,
            },
        };

        const { data } = await Axios.request(options);

        if (!data.status) {
            errorlog.error("Easebuzz refund failed", data);
            return { success: false, message: "UNABLE TO REFUND", data: data };
        }

        return { success: true, message: "REFUND SUCCESS", data: data };
    } catch (error) {
        errorlog.error("Easebuzz refund failed", error);
        return { success: false, message: "SERVER ERROR", data: null };
    }
};

const processExpressRefund = async (
    easeBuzzData,
    amount,
    orderId,
    refundId
) => {
    try {
        const toHash = `${process.env.wireKey}|||${easeBuzzData.upi_va}|REFUND${easeBuzzData.easepayid}|${amount}|${process.env.wireSalt}`;
        const hashed = Crypto.createHash("sha512").update(toHash).digest("hex");
        const options = {
            method: "POST",
            url: "https://wire.easebuzz.in/api/v1/quick_transfers/initiate/",
            headers: {
                Authorization: hashed,
                "WIRE-API-KEY": process.env.wireKey,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            data: {
                key: process.env.wireKey,
                virtual_account_number: process.env.virtualAccountNo,
                beneficiary_type: "upi",
                beneficiary_name: String(easeBuzzData.firstname) || "UNNAMED",
                upi_handle: easeBuzzData.upi_va,
                unique_request_number: `REFUND${easeBuzzData.easepayid}`,
                payment_mode: "UPI",
                amount: amount,
                email: easeBuzzData.email,
                phone: easeBuzzData.phone,
                narration: `Refund for order id ${orderId}`,
                udf1: "upiRefund",
                udf2: String(refundId),
                udf3: String(amount),
            },
        };

        const response = await Axios.request(options);
        console.log({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
        });
        const data = response.data;
        if (data.success) {
            return { success: true, message: "Refund Processed", data: data };
        } else {
            errorlog.error(
                "easebuzz transfer failed",
                JSON.stringify(data, null, 2)
            );
            return {
                success: false,
                message:
                    data.data?.transfer_request?.failure_reason || "FAILED",
                data: data,
            };
        }
    } catch (error) {
        errorlog.error("error in processing express refund", error);
        return { success: false, message: "SERVER ERROR", data: null };
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
        errorlog.error("Error in processCodRefund", error);
        return false;
    }
};

module.exports = [checkRequest, processRefund];
