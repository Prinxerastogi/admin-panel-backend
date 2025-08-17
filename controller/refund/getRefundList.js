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
        
        // Lookup previous refund requests for the same order (excluding pending status)
        {
            $lookup: {
                from: "refunds",
                let: { currentOrderId: "$orderId", currentRefundId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$orderId", "$$currentOrderId"] },
                                    { $ne: ["$_id", "$$currentRefundId"] },
                                    { $ne: ["$status", "pending"] }  // Only non-pending requests
                                ]
                            }
                        }
                    },
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $project: {
                            status: 1,
                            createdAt: 1,
                            acceptedOn: 1,
                            rejectedOn: 1,
                            amount: 1
                        }
                    }
                ],
                as: "previousRequests"
            }
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
                },
                // Add fields for previous request information
                hasPreviousRequests: {
                    $gt: [{ $size: "$previousRequests" }, 0]
                },
                previousRequestsCount: {
                    $size: "$previousRequests"
                },
                lastPreviousRequest: {
                    $cond: [
                        { $gt: [{ $size: "$previousRequests" }, 0] },
                        { $arrayElemAt: ["$previousRequests", 0] },
                        null
                    ]
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
        },
        
        // Final projection to clean up the output
        {
            $project: {
                id: 1,
                orderId: 1,
                amount: 1,
                status: 1,
                products: 1,
                deliveryFee: 1,
                deliveryFeeAmount: 1,
                customAmount: 1,
                customAmountReason: 1,
                smallCartFee: 1,
                smallCartFeeAmount: 1,
                amountSplit: 1,
                refundBreakdown: 1,
                rejectedOn: 1,
                acceptedOn: 1,
                refundReason: 1,
                refundOtherReason: 1,
                createdAt: 1,
                updatedAt: 1,
                orderDetails: 1,
                productDetails: 1,
                hasPreviousRequests: 1,
                previousRequestsCount: 1,
                previousRequests: 1,
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