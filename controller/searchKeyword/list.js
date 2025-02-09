"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    paginationController = require("../pagination/pagination"),
    schema = require("../../sharedmb/schema/searchKeyword");

module.exports = [
    (req, res) => {
        let pagination = {
            page: Number(req.query.start),
            limit: Number(req.query.limit),
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
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $lookup: {
                    from: "cities",
                    localField: "cityId",
                    foreignField: "_id",
                    as: "city",
                },
            },
            {
                $unwind: {
                    path: "$city",
                },
            },
            {
                $group: {
                    _id: {
                        day: "$day",
                        month: "$month",
                        year: "$year",
                    },
                    data: {
                        $addToSet: "$$ROOT",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    data: 1,
                },
            },
            {
                $unwind: {
                    path: "$data",
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$data",
                },
            },
            {
                $sort: {
                    date: -1,
                },
            },
        ];

        if (pagination.page >= 0 && pagination.limit) {
            condition.push(
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: 1,
                        },
                        data: {
                            $push: "$$ROOT",
                        },
                    },
                },
                {
                    $unwind: {
                        path: "$data",
                    },
                },
                {
                    $addFields: {
                        "data.total": "$total",
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$data",
                    },
                },
                {
                    $skip: pagination.page * pagination.limit,
                },
                {
                    $limit: pagination.limit,
                }
            );
        }
        crudModel.aggregation(condition, schema, (err, data) => {
            if (err) {
                return res
                    .status(400)
                    .json({ success: false, error: true, err });
            } else {
                return res.status(200).json({ success: true, data: data });
            }
        });
    },
];
