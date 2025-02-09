let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/banner");

module.exports = [
    (req, res) => {
        let pagination = {
            page: Number(req.query.start),
            limit: Number(req.query.end),
        };
        let condition = [
            {
                $match: {
                    isDeleted: false,
                },
            },
        ];
        if (req.query.start != null && req.query.end != null) {
            condition.push(
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: 1,
                        },
                        banners: {
                            $push: "$$ROOT",
                        },
                    },
                },

                {
                    $unwind: {
                        path: "$banners",
                    },
                },
                {
                    $addFields: {
                        "banners.total": "$total",
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$banners",
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
        crud.aggregation(condition, schema, (err, banners) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in banner",
                    err,
                });
            }
            if (banners && banners.length > 0) {
                return res
                    .status(200)
                    .json({ success: true, message: " data found", banners });
            } else
                return res
                    .status(201)
                    .json({ success: false, message: " No data found" });
        });
    },
];
