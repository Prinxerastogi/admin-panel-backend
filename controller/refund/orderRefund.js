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
                id: Number(req.body.orderId),
            },
        },
    ];
    crud.aggregation(condition, orderSchema, (err, order) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occurred in findOrder",
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
let checkAlreadyRequestedRefund = (req, res, next) => {
    console.log("Order found");
    refundSchema
        .findOne({ orderId: req.data.order._id, status: "pending" })
        .then((refundDocument) => {
            if (refundDocument) {
                return res.status(201).json({
                    success: false,
                    message: `Refund Number #${refundDocument.id} already pending`,
                });
            } else next();
        });
};
let calculateRefundAmount = (req, res, next) => {
    console.log("No existing requests found");
    let totalRefundAmount = 0;
    let productRefunds = req.body.products;
    let orderProducts = req.data.order.product;

    productRefunds.forEach((product) => {
        let productId = Object.keys(product)[0];
        let quantityToRefund = product[productId];
        let orderProduct = orderProducts.find((p) => p.id == productId);

        if (orderProduct) {
            totalRefundAmount += orderProduct.sellPrice * quantityToRefund;
        }
    });
    if (req.body.isDeliveryFee) {
        totalRefundAmount += req.data.order?.deliveryCharge || 0;
    }
    if (req.body.isSmallCartFee) {
        totalRefundAmount += req.data.order?.smallCartFee || 0;
    }

    req.data.totalRefundAmount = totalRefundAmount;
    next();
};

let checkRefundAmountFromOrderAmount = (req, res, next) => {
    console.log("Total refundal amount calculated", req.data.totalRefundAmount);
    if (req.data.totalRefundAmount > req.data.order.amount) {
        return res.status(201).json({
            success: false,
            message: "you cannot refund more than the order amount",
        });
    } else {
        if (req.body.readOnly) {
            return res.status(200).json({
                success: true,
                amount: req.data.totalRefundAmount,
                message: "Acknowledged",
            });
        } else next();
    }
};

let createRefundRequest = (req, res) => {
    console.log("Total refundal amount verified");
    if (
        !req.data.order._id ||
        !req.data.totalRefundAmount ||
        !req.body.products ||
        !req.body.amountSplit
    ) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
        });
    }

    // Validate that amountSplit matches total refund amount
    const totalSplitAmount =
        (req.body.amountSplit.wallet || 0) +
        (req.body.amountSplit.cash || 0) +
        (req.body.amountSplit.online || 0);

    if (totalSplitAmount !== req.data.totalRefundAmount) {
        return res.status(400).json({
            success: false,
            message: "Amount split total must match the refund amount",
        });
    }

    let refund = new refundSchema({
        orderId: req.data.order._id,
        amount: req.data.totalRefundAmount,
        products: req.body.products,
        amountSplit: req.body.amountSplit,
        deliveryFee: req.body.isDeliveryFee,
        deliveryFeeAmount: req.body.isDeliveryFee
            ? req.data.order?.deliveryCharge
            : 0,
        smallCartFee: req.body.isSmallCartFee,
        smallCartFeeAmount: req.body.isSmallCartFee
            ? req.data.order?.smallCartFee
            : 0,
    });
    refund.save((err, refund) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occurred in createRefundRequest",
                err,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "refund request created successfully",
                refund,
            });
        }
    });
};

module.exports = [
    findOrder,
    checkAlreadyRequestedRefund,
    calculateRefundAmount,
    checkRefundAmountFromOrderAmount,
    createRefundRequest,
];
