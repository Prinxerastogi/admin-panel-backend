const { isNumber } = require("underscore");
const deliveryBoySchema = require("../../sharedmb/schema/deliveryBoy");
const deliveryBoyTransactionSchema = require("../../sharedmb/schema/deliveryBoyTransactions");
const { Types } = require("mongoose");

const getUserDetails = async (req, res, next) => {
    try {
        req.data = {};
        if (
            !req.body.phoneNo ||
            req.body.phoneNo === "" ||
            req.body.amount === "" ||
            !req.body.amount ||
            !req.body.remarks ||
            req.body.remarks === ""
        ) {
            return res
                .status(400)
                .json({ success: false, message: "invalid params" });
        }
        const result = await deliveryBoySchema.findOne({
            phoneNo: req.body.phoneNo,
        });
        if (!result) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        req.data.prevBalance = result.currentBalance;
        req.data.deliveryPartnerId = result._id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error finding user details",
            error,
        });
    }
};

const createEarningTransaction = async (req, res, next) => {
    try {
        if ("credit" !== req.body.type && "debit" !== req.body.type) {
            return res.json({ success: false, message: "invalid type" });
        }
        const amount = parseFloat(req.body.amount.toFixed(2));
        req.data.earning = req.body.type === "debit" ? -amount : amount;

        if (!isNumber(req.data.earning)) {
            return res.json({
                success: false,
                message: "Transaction creation failed",
            });
        }
        const transaction = await deliveryBoyTransactionSchema.create([
            {
                type: req.body.type,
                deliveryPartnerId: req.data.deliveryPartnerId,
                created: new Date(),
                updated: new Date(),
                amount: amount,
                openingBalance: req.data.prevBalance,
                closingBalance: req.data.prevBalance + req.data.earning,
                remarks: req.body.remarks,
            },
        ]);

        if (!transaction) {
            return res.json({
                success: false,
                message: "Transaction creation failed",
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error creating transaction",
            error,
        });
    }
};

// Middleware to update ranking and balance
const updateRanking = async (req, res, next) => {
    try {
        const result = await deliveryBoySchema.findOneAndUpdate(
            { _id: new Types.ObjectId(req.data.deliveryPartnerId) },
            { $inc: { currentBalance: req.data.earning } },
            { new: true }
        );

        if (!result) {
            return res.json({
                success: false,
                message: "Error updating ranking",
            });
        }

        res.status(200).json({ success: true, message: "Earning adjusted" });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Error updating ranking", error });
    }
};

module.exports = [getUserDetails, createEarningTransaction, updateRanking];
