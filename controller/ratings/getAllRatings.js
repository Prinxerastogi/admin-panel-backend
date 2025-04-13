"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    orderSchema = require("../../sharedmb/schema/order"),
    mongoose = require("mongoose"),
    MESSAGE = require("../order/message"),
    MBID = require("../../sharedmb/MBId/MBOrderId");

let getOrderCount = (req, res, next) => {
    let startDate,
        endDate,
        condition = [];
    if (req.query.sellerId != null) {
        condition = [
            {
                $match: {
                    sellerId: mongoose.Types.ObjectId(req.query.sellerId),
                },
            },
        ];
    }
    if (req.query.status !== "all" && req.query.status !== undefined)
        condition.push({ $match: { status: req.query.status } });

    if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
    } else {
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 10);
    }
    condition.push({
        $match: {
            $expr: {
                $and: [
                    { $gte: ["$date", startDate] },
                    { $lt: ["$date", endDate] },
                ],
            },
        },
    });
    crudModel.aggregation(condition, orderSchema, (err, orders) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.findOrder.error,
                error: err,
            });
        } else if (orders == null) {
            return res
                .status(202)
                .json({ success: false, message: MESSAGE.findOrder.noOrders });
        } else if (orders && orders.length > 0) {
            req.ordercounts = orders.length;
            console.log(orders.length);
            next();
        } else {
            return res
                .status(201)
                .json({ success: false, message: MESSAGE.findOrder.notFound });
        }
    });
};

let findOrders = (req, res) => {
    let startDate;
    let endDate;
    let condition = [];
    let project = {
        date: -1,
        created: 1,
        _id: 1,
        deliveryTime: 1,
        deliveryDate: 1,
        paymentMode: 1,
        totalProduct: {
            $size: "$product",
        },
        amount: "$amount",
        isOrderAssigned: "$isOrderAssigned",
        otp: 1,
        id: 1,
        total: 1,
        address: 1,
        route: 1,
        paymentMode: 1,
        customerMessage: 1,
        status: 1,
        errorValidation: 1,
        tempOrderId: 1,
        userId: 1,
        userCancelStatus: 1,
        confirmedStateTime: 1,
        processedStateTime: 1,
        dispatchedStateTime: 1,
        deliveredDate: 1,
        paymentSource: 1,
        grossProfit: 1,
        rating: 1,
        deliveryBoyComments: 1,
        deliveryBoyRating: 1,
    };
    let sort = {
        date: -1,
        "route.group": -1,
        "route.name": 1,
        "route.priority": 1,
    };

    console.log(req.query);

    if (req.query.sortBy) {
        if (req.query.sortBy === 'highest_rating') {
            sort = { rating: -1 };
        } else if (req.query.sortBy === 'lowest_rating') {
            sort = { rating: 1 }; 
        } else if (req.query.sortBy === 'highest_delivery_rating') {
            sort = { deliveryBoyRating: -1 }; 
        } else if (req.query.sortBy === 'lowest_delivery_rating') {
            sort = { deliveryBoyRating: 1 };
        }
    }

    if (req.query.sellerId) {
        console.log(req.query.sellerId);
        condition.push({
            $match: { sellerId: mongoose.Types.ObjectId(req.query.sellerId) },
        });
    }

    if (
        req.query.status !== "all" &&
        req.query.status !== undefined &&
        req.query.status !== null
    ) {
        condition.push({ $match: { status: req.query.status } });
    }

    if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
    } else {
        endDate = new Date();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 10);
    }

    condition.push({
        $match: {
            $expr: {
                $and: [
                    { $gte: ["$date", startDate] },
                    { $lt: ["$date", endDate] },
                ],
            },
        },
    });

    if (req.query.ratingFilter && req.query.ratingFilter !== "all") {
        const ratingValue = parseInt(req.query.ratingFilter);

        if (ratingValue === -1) {
            condition.push({
                $match: {
                    $or: [
                        { rating: { $exists: false } },
                        { rating: 0 },
                        { rating: null }
                    ]
                }
            });
        } else if ([1, 2, 3, 4, 5].includes(ratingValue)) {
            condition.push({
                $match: {
                    rating: ratingValue
                }
            });
        }
    } else {
        condition.push({
            $match: {
                $or: [
                    { rating: { $ne: 0, $exists: true } },
                    { deliveryBoyRating: { $ne: 0, $exists: true } },
                    { deliveryBoyComments: { $ne: "", $exists: true } }
                ]
            }
        });
    }


    // condition.push({
    //     $match: {
    //         $or: [
    //             { rating: { $ne: 0, $exists: true } },
    //             { deliveryBoyRating: { $ne: 0, $exists: true } },
    //             { deliveryBoyComments: { $ne: "", $exists: true } }
    //         ]
    //     }
    // });

    condition.push({ $sort: sort }, { $project: project });

    let pagination = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 40,
    };

    condition.push(
        {
            $skip: (pagination.page - 1) * pagination.limit,
        },
        {
            $limit: pagination.limit,
        }
    );

    // console.log(condition);

    crudModel.aggregation(condition, orderSchema, (err, orders) => {
        if (err) {
            console.error("error", err);
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.findOrder.error,
                error: err,
            });
        } else if (orders == null) {
            return res
                .status(202)
                .json({ success: false, message: MESSAGE.findOrder.noOrders });
        } else if (orders && orders.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${orders.length} ${MESSAGE.findOrder.found}`,
                orders: orders,
                totalOrderCount: req.ordercounts,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: MESSAGE.findOrder.notFound });
        }
    });
};

module.exports = [getOrderCount, findOrders];
