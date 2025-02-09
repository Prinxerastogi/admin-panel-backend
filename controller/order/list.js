let schema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");

module.exports = [
    (req, res) => {
        let pagination = {
            page: Number(req.query.start),
            limit: Number(req.query.limit),
        };

        let condition = [
            {
                $sort: {
                    date: -1,
                },
            },
            // {
            //     $lookup: {
            //         from: 'users',
            //         localField: 'userId',
            //         foreignField: '_id',
            //         as: 'user'
            //     }
            // },
            // {
            //     $unwind: {
            //         'path': '$user'
            //     }
            // }
        ];
        if (pagination.page >= 0 && pagination.limit) {
            condition.push(
                {
                    $group: {
                        _id: null,
                        // total: {
                        //     $sum: 1
                        // },
                        blogs: {
                            $push: "$$ROOT",
                        },
                    },
                },
                {
                    $unwind: {
                        path: "$blogs",
                    },
                },
                // {
                //     $addFields: {
                //         'blogs.total': '$total'
                //     }
                // },
                {
                    $replaceRoot: {
                        newRoot: "$blogs",
                    },
                },
                {
                    $skip: pagination.page * pagination.limit,
                },
                {
                    $limit: 10,
                }
            );
        }

        schema
            .aggregate(condition, (err, orders) => {
                if (err)
                    return res
                        .status(400)
                        .json({ message: "error occured in orderlist", err });
                else if (orders && orders.length > 0)
                    return res.status(200).json({
                        success: true,
                        message: "list found",
                        orders: orders,
                    });
                return res.status(201).json({
                    success: false,
                    message: "order list  not found",
                    I,
                });
            })
            .allowDiskUse();
    },
];
