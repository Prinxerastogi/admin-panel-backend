let orderSchema = require("../../sharedmb/schema/order");
let moment = require("moment");
let mongoose = require("mongoose");
crud = require("../../sharedmb/models/crud");

let getOrders = (req, res) => {
    let aggregate = [];
    if (req.query.sellerId) {
        aggregate.push({
            $match: {
                sellerId: mongoose.Types.ObjectId(req.query.sellerId),
            },
        });
    }
    aggregate.push(
        {
            $addFields: {
                deliveryDate: {
                    $dateFromString: {
                        dateString: "$date",
                        onError: "$date",
                    },
                },
            },
        },
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $gte: [
                                {
                                    $dateFromString: {
                                        dateString: "$date",
                                        onError: "$date",
                                    },
                                },
                                {
                                    $dateFromString: {
                                        //dateString: req.query.from ? moment(req.query.from).format() : moment().add(-60, 'days').format()
                                        dateString: req.query.from
                                            ? moment(req.query.from)
                                                  .utcOffset(330)
                                                  .startOf("day")
                                                  .format()
                                            : moment()
                                                  .utcOffset(330)
                                                  .add(-60, "days")
                                                  .startOf("day")
                                                  .format(),
                                    },
                                },
                            ],
                        },
                        {
                            $lt: [
                                {
                                    $dateFromString: {
                                        dateString: "$date",
                                        onError: "$date",
                                    },
                                },
                                {
                                    $dateFromString: {
                                        //dateString: req.query.to ? moment(req.query.to).format() : moment().format()
                                        dateString: req.query.to
                                            ? moment(req.query.to)
                                                  .utcOffset(330)
                                                  .endOf("day")
                                                  .format()
                                            : moment()
                                                  .utcOffset(330)
                                                  .endOf("day")
                                                  .format(),
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        {
            $addFields: {
                date: {
                    $dateFromString: {
                        dateString: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                    },
                },
            },
        },
        {
            $group: {
                _id: "$date",
                amount: {
                    $sum: "$amount",
                },
                orders: {
                    $sum: 1,
                },
                date: {
                    $last: "$date",
                },
                sellerId: {
                    $first: "$sellerId",
                },
            },
        }
    );
    if (req.query.type == "week") {
        aggregate.push({
            $sort: {
                _id: -1,
            },
        });
        aggregate.push({
            $group: {
                _id: {
                    year: { $year: "$_id" },
                    week: { $week: "$_id" },
                },
                amount: {
                    $sum: "$amount",
                },
                orders: {
                    $sum: "$orders",
                },
                date: {
                    $first: "$date",
                },
            },
        });
    } else if (req.query.type == "month") {
        aggregate.push({
            $sort: {
                _id: -1,
            },
        });
        aggregate.push({
            $group: {
                _id: {
                    year: { $year: "$_id" },
                    month: { $month: "$_id" },
                },
                amount: {
                    $sum: "$amount",
                },
                orders: {
                    $sum: "$orders",
                },
                date: {
                    $first: "$date",
                },
            },
        });
    }
    let sort = [
        {
            $sort: {
                _id: 1,
            },
        },
        {
            $group: {
                _id: null,
                orders: {
                    $push: {
                        name: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                        value: "$orders",
                    },
                },
                amount: {
                    $push: {
                        name: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                        value: "$amount",
                    },
                },
                totalOrders: {
                    $sum: "$orders",
                },
                totalAmount: {
                    $sum: "$amount",
                },
                deliveryCharge: {
                    $sum: "$deliveryCharge",
                },
            },
        },
    ];
    aggregate = [...aggregate, ...sort];
    orderSchema.aggregate(aggregate, (err, response) => {
        let count = 0;
        if (err) {
            return res.status(400).json({
                message: "error occured in graph query",
                success: false,
                error: err,
            });
        } else if (response.length > 0) {
            crud.find({}, orderSchema, (error2, response2) => {
                if (error2) {
                    return res.status(400).json({
                        message: "error occured in graph query",
                        success: false,
                        error: err,
                    });
                }
                if (response2.length) {
                    count = response2.length;
                    return res.status(200).json({
                        message: "graph data",
                        success: true,
                        data: response[0],
                        totalUser: count,
                    });
                } else {
                    return res
                        .status(201)
                        .json({ message: "No data found", success: false });
                }
            });
        } else {
            return res.status(201).json({
                message: "No data found",
                data: [],
                success: false,
                totalUser: count,
            });
        }
    });
};

module.exports = [getOrders];
