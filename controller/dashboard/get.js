let schema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
let config = require("config");

module.exports = [
    (req, res) => {
        let todayDate = new Date();
        let fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - config.previousDay);

        let toDate = {
            day: todayDate.getDate(),
            month: todayDate.getMonth() + 1,
            year: todayDate.getFullYear(),
        };

        let NewfromDate = {
            day: fromDate.getDate(),
            month: fromDate.getMonth() + 1,
            year: fromDate.getFullYear(),
        };

        let condition = [
            {
                $addFields: {
                    year: {
                        $year: "$date",
                    },
                    month: {
                        $month: "$date",
                    },
                    day: {
                        $dayOfMonth: "$date",
                    },
                    dayOfWeek: {
                        $dayOfWeek: "$date",
                    },
                    hour: {
                        $hour: "$date",
                    },
                    minutes: {
                        $minute: "$date",
                    },
                    seconds: {
                        $second: "$date",
                    },
                },
            },
            {
                $match: {
                    date: {
                        $gte: fromDate,
                        $lte: todayDate,
                    },
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
                    from: "orders",
                    localField: "user._id",
                    foreignField: "userId",
                    as: "user.orders",
                },
            },
            {
                $addFields: {
                    UserNoOfOrder: {
                        $size: "$user.orders",
                    },
                    userOrdertotal: {
                        $sum: "$user.orders.amount",
                    },
                },
            },
            {
                $group: {
                    _id: "$dayOfWeek",
                    recurringClientSell: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: ["$UserNoOfOrder", 1],
                                },
                                "$amount",
                                0,
                            ],
                        },
                    },
                    newClientSell: {
                        $sum: {
                            $cond: [
                                {
                                    $lte: ["$UserNoOfOrder", 1],
                                },
                                "$amount",
                                0,
                            ],
                        },
                    },
                    dayOfWeek: {
                        $first: "$dayOfWeek",
                    },
                },
            },
            {
                $addFields: {
                    recurringClintSellPercent: {
                        $multiply: [
                            {
                                $divide: [
                                    "$recurringClientSell",
                                    {
                                        $add: [
                                            "$recurringClientSell",
                                            "$newClientSell",
                                        ],
                                    },
                                ],
                            },
                            100,
                        ],
                    },
                    newClintSellPercent: {
                        $multiply: [
                            {
                                $divide: [
                                    "$newClientSell",
                                    {
                                        $add: [
                                            "$recurringClientSell",
                                            "$newClientSell",
                                        ],
                                    },
                                ],
                            },
                            100,
                        ],
                    },
                },
            },
            {
                $sort: {
                    dayOfWeek: 1,
                },
            },

            {
                $group: {
                    _id: "null",
                    weekSale: {
                        $push: "$$ROOT",
                    },
                    newClientSale: {
                        $sum: "$newClientSell",
                    },
                    recurringClientSell: {
                        $sum: "$recurringClientSell",
                    },
                },
            },
        ];

        crud.aggregation(condition, schema, (err, data) => {
            if (err) {
                return res
                    .status(400)
                    .json({ success: false, message: "error", err });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "data found",
                    data: data[0],
                });
            }
        });
    },
];
