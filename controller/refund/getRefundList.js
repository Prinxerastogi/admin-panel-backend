"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    refundSchema = require("../../sharedmb/schema/refund"),
    mongoose = require("mongoose");
const order = require("../../sharedmb/schema/order");

module.exports = (req, res) => {
    let currentUser = req.decoded;
    let userId = currentUser.id;
    const page = Math.max(0, parseInt(req.query.page) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Max 100 items per page
    const skip = page * limit;
    
    let condition = [
        { $match: {} },
        
        {
            $sort: {
                createdAt: -1,  
                _id: -1      
            },
        },
        
        { $skip: skip },
        { $limit: limit },
        
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
                            _id: 0
                        }
                    }
                ],
                as: "productDetails"
            }
        },
        
        {
            $addFields: {
                productDetails: {
                    $map: {
                        input: "$productDetails",
                        as: "product",
                        in: {
                            $mergeObjects: [
                                "$$product",
                                {
                                    sellPrice: {
                                        $let: {
                                            vars: {
                                                matchedProduct: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: "$orderDetails.products",
                                                                as: "op",
                                                                cond: {
                                                                    $eq: [
                                                                        { $ifNull: [{ $toInt: "$$op.id" }, "$$op.id"] },
                                                                        { $ifNull: [{ $toInt: "$$product.id" }, "$$product.id"] }
                                                                    ]
                                                                }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: "$$matchedProduct.sellPrice"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    ];

    crudModel.aggregation(condition, refundSchema, (err, refundRequest) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "error occured in find refundList",
                error: err,
            });
        }
    
        if (refundRequest && refundRequest.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${refundRequest.length} requests found`,
                requests: refundRequest,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "Request not found" });
        }
    });
};