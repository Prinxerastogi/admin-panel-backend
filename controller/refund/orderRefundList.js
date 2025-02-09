let refundSchema = require("../../sharedmb/schema/refund");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

let refundList = (req, res) => {
    let condition = [
        {
            $match: {
                orderId: mongoose.Types.ObjectId(req.query.orderId),
            },
        },
        {
            $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "order",
            },
        },
        {
            $unwind: {
                path: "$order",
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
        {
            $lookup: {
                from: "admins",
                localField: "refundBy",
                foreignField: "_id",
                as: "refundBy",
            },
        },
        {
            $unwind: {
                path: "$refundBy",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: {
                path: "$product",
                includeArrayIndex: "yes",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    crud.aggregation(condition, refundSchema, (err, orderRefundList) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in refundList",
                err,
            });
        } else if (orderRefundList && orderRefundList.length > 0) {
            return res.status(200).json({
                success: true,
                message: "refunds found",
                refundList: orderRefundList,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "no refund found" });
        }
    });
};

module.exports = [refundList];
