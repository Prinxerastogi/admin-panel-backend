const walletTransactionSchema = require("../../sharedmb/schema/walletTransaction");
const userSchema = require("../../sharedmb/schema/user");
const { Types } = require("mongoose");

const getUser = async (req, res, next) => {
    try {
        if (!req.body.phoneNo || !req.body.amount || !req.body.message) {
            return res.json({
                success: false,
                error: true,
                message: "Invalid request",
            });
        }
        req.data = {};
        const user = await userSchema.findOne({ phoneNo: req.body.phoneNo });
        if (!user) {
            return res.json({
                success: false,
                error: true,
                message: "User not found",
            });
        }
        req.data.userId = user._id;
        next();
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            error: true,
            message: "Internal Server Error",
            err: err,
        });
    }
};

const createTransaction = async (req, res, next) => {
    try {
        const now = new Date();

        const transaction = await walletTransactionSchema.create({
            userId: req.data.userId,
            type: req.body.amount > 0 ? "credit" : "debit",
            status: "success",
            amount:
                req.body.amount > 0 ? req.body.amount : req.body.amount * -1,
            created: now,
            updated: now,
            date: now,
            message: req.body.message,
        });
        if (!transaction) {
            return res.json({
                success: false,
                error: true,
                message: "Transaction failed",
            });
        }
        const user = await userSchema.findOneAndUpdate(
            { _id: Types.ObjectId(req.data.userId) },
            { $inc: { walletBalance: req.body.amount } },
            { new: true, projection: { walletBalance: 1 } }
        );
        console.log(user);
        if (!user) {
            return res.json({
                success: false,
                error: true,
                message: "User not found",
            });
        }
        return res.json({ success: true, message: "Transaction successfull" });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            error: true,
            message: "Internal Server Error",
            err: error,
        });
    }
};

module.exports = [getUser, createTransaction];
