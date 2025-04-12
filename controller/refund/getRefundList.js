"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    refundSchema = require("../../sharedmb/schema/refund"),
    mongoose = require("mongoose");
const order = require("../../sharedmb/schema/order");

module.exports = (req, res) => {
    let currentUser = req.decoded;
    let userId = currentUser.id;
    let condition = [
        { $match: {} },
        {
            $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "orderDetails",
            },
        },
        {
            $unwind: {
                path: "$orderDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $sort: {
                id: -1,
            },
        },
    ];
    if (req.query.page && req.query.limit) {
        let pagination = {
            page: Number(req.query.page),
            limit: Number(req.query.limit),
        };
        let paginate = [
            {
                $skip: pagination.page * pagination.limit,
            },
            {
                $limit: pagination.limit,
            },
        ];
        condition = [...condition, ...paginate];
    }
    crudModel.aggregation(condition, refundSchema, (err, refundRequest) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "error occured in find refundList",
                error: err,
            });
        }
        console.log("Refund", refundRequest);
        if (refundRequest && refundRequest.length > 0) {
            return res.status(200).json({
                success: true,
                message: ` ${refundRequest.length} requests found`,
                requests: refundRequest,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "Request not found" });
        }
    });
};
