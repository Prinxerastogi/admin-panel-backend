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
        // Modified product IDs extraction
        {
            $addFields: {
                productIds: {
                    $map: {
                        input: "$products",
                        as: "prod",
                        in: {
                            $let: {
                                vars: {
                                    firstKey: { $arrayElemAt: [{ $objectToArray: "$$prod" }, 0] }
                                },
                                in: {
                                    $cond: [
                                        { $eq: [{ $type: "$$firstKey.k" }, "string"] },
                                        { $toInt: "$$firstKey.k" },
                                        "$$firstKey.k"
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        // Safer product lookup
        {
            $lookup: {
                from: "products",
                let: { productIds: "$productIds" },
                pipeline: [
                    {
                        $addFields: {
                            idInt: {
                                $cond: [
                                    { $eq: [{ $type: "$id" }, "string"] },
                                    { $toInt: "$id" },
                                    "$id"
                                ]
                            }
                        }
                    },
                    {
                        $match: {
                            $expr: { $in: ["$idInt", "$$productIds"] }
                        }
                    },
                    {
                        $project: {
                            id: 1,
                            name: 1,
                            images: 1,
                            sellPrice: 1,
                            _id: 0
                        }
                    }
                ],
                as: "productDetails"
            }
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
