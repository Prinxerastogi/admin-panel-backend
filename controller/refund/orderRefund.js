// API 1.
//parameter ( orderId, userId, Amount,message,type)
// find Order From OrderId

// check form refund Schema and get orderId refund value.

//calculate already refundvalue.
//refund Entry 1 amount  + refund Entry 2

// if(refundvalue>=orderAmount){
//   send Error msg (u can not refund more than order amaunt)
//}

//else{
// create a refund transaction
// create a refund enrty
// add refund amount to user wallet.
//}

// API 2.get refund fromorderId

let refundSchema = require("../../sharedmb/schema/refund");
let userSchema = require("../../sharedmb/schema/user");
let orderSchema = require("../../sharedmb/schema/order");
let walletTransaction = require("../../sharedmb/schema/walletTransaction");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

let findOrder = (req, res, next) => {
    let condition = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.body.orderId),
                userId: mongoose.Types.ObjectId(req.body.userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: {
                path: "$user",
            },
        },
    ];
    crud.aggregation(condition, orderSchema, (err, order) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in findOrder",
                err,
            });
        } else if (order && order.length > 0) {
            req.data = {};
            req.data.order = order[0];
            next();
        } else {
            return res
                .status(201)
                .json({ success: false, message: "no order found" });
        }
    });
};

let checkRefundAmount = (req, res, next) => {
    let condition = [
        {
            $match: {
                orderId: mongoose.Types.ObjectId(req.body.orderId),
            },
        },
        {
            $group: {
                _id: "$orderId",
                totalRefundAmount: {
                    $sum: "$amount",
                },
            },
        },
        {
            $addFields: {
                totalRefundAmount: {
                    $add: ["$totalRefundAmount", Number(req.body.amount)],
                },
            },
        },
    ];
    crud.aggregation(condition, refundSchema, (err, refundAmount) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in findOrder",
                err,
            });
        } else if (refundAmount && refundAmount.length > 0) {
            req.data.totalRefundAmount = refundAmount[0].totalRefundAmount;
            next();
        } else {
            req.data.totalRefundAmount = Number(req.body.amount);
            next();
        }
    });
};

let checkRefundAmountFromOrderAmount = (req, res, next) => {
    if (req.data.totalRefundAmount >= req.data.order.amount) {
        return res.status(201).json({
            success: false,
            message: "you can not refund more than order amaunt",
        });
    } else {
        next();
    }
};

let createRefundTransaction = (req, res, next) => {
    let now = new Date().getTime();
    let refundTransactionData = {
        orderId: req.body.orderId,
        userId: req.body.userId,
        sellerId: req.data.order.sellerId,
        transactionId: now,
        status: "refunded", //created authorized,captured,refunded,failed
        updatedBalance: req.data.order.user.balance + Number(req.body.amount),
        oldBalance: req.data.order.user.balance,
        type: req.body.type ? req.body.type : "",
        paymentMode: "wallet",
        amount: Number(req.body.amount),
        credited: true,
        debited: false,
        created: now,
        updated: now,
        date: new Date(),
        mobileNo: req.data.order.address.mobileNo
            ? req.data.order.address.mobileNo
            : req.data.order.user.phoneNo,
    };
    crud.create(
        refundTransactionData,
        walletTransaction,
        (err, transactionCreated) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "error occured in createRefundTransaction",
                    err,
                });
            } else if (transactionCreated) {
                req.data.transaction = transactionCreated;
                next();
            } else {
                return res.status(201).json({
                    success: false,
                    message: "something went wrong in createRefundTransaction ",
                });
            }
        }
    );
};

let refundEntry = (req, res, next) => {
    let TodayDate = new Date();
    let refundData = {
        userId: req.body.userId,
        amount: Number(req.body.amount),
        type: req.body.type ? req.body.type : "orderRefund",
        refundBy: req.decoded.id,
        message: req.body.message,
        orderId: req.body.orderId,
        transactionId: req.data.transaction._id,
        created: TodayDate,
        updated: TodayDate,
        date: TodayDate,
    };
    crud.create(refundData, refundSchema, (err, refundEntryCreated) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in refundEntry",
                err,
            });
        } else if (refundEntryCreated) {
            req.data.refundData = refundEntryCreated;
            next();
        } else {
            return res.status(201).json({
                success: false,
                message: "something went wrong in refundEntry ",
            });
        }
    });
};

let updateUserWallet = (req, res) => {
    crud.updateOne(
        {
            _id: req.body.userId,
        },
        {
            $inc: {
                balance: Number(req.body.amount),
            },
        },
        {},
        userSchema,
        (err, walletUpdated) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "error occured in updateUserWallet",
                    err,
                });
            } else if (walletUpdated.n > 0 && walletUpdated.nModified > 0) {
                return res
                    .status(200)
                    .json({ success: true, message: "refund successfully" });
            } else {
                return res.status(201).json({
                    success: false,
                    message: "something went wrong in updateUserWallet ",
                });
            }
        }
    );
};

module.exports = [
    findOrder,
    checkRefundAmount,
    checkRefundAmountFromOrderAmount,
    createRefundTransaction,
    refundEntry,
    updateUserWallet,
];
