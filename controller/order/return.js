let orderSchema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
let userSchema = require("../../sharedmb/schema/user");
let refundSchema = require("../../sharedmb/schema/refund");
let walletTransaction = require("../../sharedmb/schema/walletTransaction");
let mongoose = require("mongoose");

let findOrderReturnProduct = (req, res, next) => {
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.body.orderId),
        "returnProducts.productId": new mongoose.Types.ObjectId(
          req.body.productId
        ),
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
      return res
        .status(201)
        .json({ success: false, message: "product already refunded" });
    } else {
      next();
    }
  });
};

let findOrder = (req, res, next) => {
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.body.orderId),
        //isReturn: false
        //  userId: new mongoose.Types.ObjectId(req.body.userId)
        //  'returnProducts.productId': new mongoose.Types.ObjectId(req.body.productId),
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
        orderId: new mongoose.Types.ObjectId(req.body.orderId),
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
    userId: req.data.order.userId,
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
    userId: req.data.order.userId,
    productId: req.body.productId,
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

let updateUserWallet = (req, res, next) => {
  crud.updateOne(
    {
      _id: req.data.order.userId,
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
        next();
        // return res.status(200).json({ success: true, message: 'refund successfully', });
      } else {
        return res.status(201).json({
          success: false,
          message: "something went wrong in updateUserWallet ",
        });
      }
    }
  );
};

let updateOrderreturnProducts = (req, res) => {
  crud.updateOne(
    { _id: req.body.orderId },
    {
      $push: {
        returnProducts: {
          productId: req.body.productId,
          price: Number(req.body.amount),
          unitPrice: Number(req.body.unitAmount),
          quantity: Number(req.body.quantity),
          created: new Date(),
          updated: new Date(),
        },
      },
      $set: {
        isReturn: true,
      },
    },
    {},
    orderSchema,
    (err, updated) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error occured in updateUserWallet",
          err,
        });
      } else if (updated.n > 0 && updated.nModified > 0) {
        return res
          .status(200)
          .json({ success: true, message: "refund successfully" });
      } else {
        return res.status(201).json({
          success: false,
          message: "something went wrong in updateOrderreturnProducts ",
        });
      }
    }
  );
};

module.exports = [
  findOrderReturnProduct,
  findOrder,
  checkRefundAmount,
  checkRefundAmountFromOrderAmount,
  createRefundTransaction,
  refundEntry,
  updateUserWallet,
  updateOrderreturnProducts,
];
