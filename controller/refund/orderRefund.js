let refundSchema = require("../../sharedmb/schema/refund");
let orderSchema = require("../../sharedmb/schema/order");
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
        } else if (order && order.length > 0 && order[0]._id) {
            req.data = {};
            req.data.order = order[0];
            console.log("ORDER REFUND REQUESTED FOR", order[0]._id);
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
    if (req.body.isPromocodeRefund) {
        totalRefundAmount -= req.data.order.couponDiscount || 0;
    }
    if (req.body.includeCustomAmount && req.body.customAmount > 0) {
        totalRefundAmount += req.body.customAmount;
    }
    req.data.totalRefundAmount = totalRefundAmount;
    next();
};

let checkRefundAmountFromOrderAmount = (req, res, next) => {
    console.log("Total refundal amount calculated", req.data.totalRefundAmount);
    const codAmount = req.data.order.paymentSource?.cod;
    const onlineAmount = req.data.order.paymentSource?.easeBuzz || 0;
    const walletAmount = req.data.order.paymentSource.wallet || 0;
    const refundableAmount =
        (codAmount < 0 ? 0 : codAmount) + onlineAmount + walletAmount;
    if (req.data.totalRefundAmount > refundableAmount) {
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

let createRefundRequest = async (req, res) => {
    console.log("Total refundal amount verified");

    const includeCustomAmount = req.body.includeCustomAmount || false;
    // Check for required fields
    const isCustomAmount = req.body.customAmount > 0;
    const hasProducts = req.body.products && req.body.products.length > 0;
    const customAmount = req.body.customAmount || 0;
    const customAmountReason = req.body.customAmountReason || null;

    if (
        !req.data.order._id ||
        (!req.data.totalRefundAmount && !isCustomAmount) ||
        !req.body.amountSplit ||
        !req.body.refundReason ||
        (!isCustomAmount && !hasProducts)
    ) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields",
            details: {
                missingOrderId: !req.data.order._id,
                missingAmount: !req.data.totalRefundAmount && !isCustomAmount,
                missingAmountSplit: !req.body.amountSplit,
                missingReason: !req.body.refundReason,
                missingProducts:
                    !isCustomAmount && !hasProducts && !includeCustomAmount,
            },
        });
    }

    const totalSplitAmount = Object.values(req.body.amountSplit).reduce(
        (sum, amount) => sum + (Number(amount) || 0),
        0
    );

    const expectedAmount =
        req.body.totalRefundAmount || req.data.totalRefundAmount;

    if (Math.abs(totalSplitAmount - expectedAmount) > 0.01) {
        return res.status(400).json({
            success: false,
            message: "Amount split total must match the refund amount",
            details: {
                totalSplitAmount,
                expectedAmount,
                difference: totalSplitAmount - expectedAmount,
            },
        });
    }

    try {
        let productDetails = [];
        let products = [];
        if (isCustomAmount) {
            products = [];
        } else {
            products = req.body.products;
            productDetails = req.data.order.product
                .filter((p) =>
                    req.body.products.some(
                        (refundProd) => refundProd[p.id] !== undefined
                    )
                )
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    images: p.images,
                    quantity: req.body.products.find(
                        (refundProd) => refundProd[p.id]
                    )[p.id],
                }));
        }

        let refund = new refundSchema({
            orderId: req.data.order._id,
            amount: expectedAmount,
            products: products,
            productDetails: productDetails,
            amountSplit: req.body.amountSplit,
            refundBreakdown: Object.keys(req.body.amountSplit).map((mode) => ({
                mode,
                status: "pending",
            })),
            deliveryFee: req.body.isDeliveryFee,
            deliveryFeeAmount: req.body.isDeliveryFee
                ? req.data.order?.deliveryCharge
                : 0,
            smallCartFee: req.body.isSmallCartFee,
            smallCartFeeAmount: req.body.isSmallCartFee
                ? req.data.order?.smallCartFee
                : 0,
            refundReason: req.body.refundReason.reason,
            refundOtherReason:
                req.body.refundReason.reason === "other"
                    ? req.body.refundReason.otherDetails
                    : null,
            includeCustomAmount: includeCustomAmount,
            customAmount: includeCustomAmount ? customAmount : 0,
            customAmountReason: includeCustomAmount ? customAmountReason : null,
        });

        const savedRefund = await refund.save();

        return res.status(200).json({
            success: true,
            message: "Refund request created successfully",
            refund: savedRefund,
        });
    } catch (err) {
        console.error("Error in createRefundRequest:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

module.exports = [
    findOrder,
    checkAlreadyRequestedRefund,
    calculateRefundAmount,
    checkRefundAmountFromOrderAmount,
    createRefundRequest,
];
