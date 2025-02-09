let crudModel = require("../../sharedmb/models/crud"),
    blogSchema = require("../../sharedmb/schema/blog");

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
                {
                    $addFields: {
                        "blogs.total": "$total",
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$blogs",
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

        crudModel.aggregation(condition, blogSchema, (err, roleList) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in findadminRoleList",
                    err,
                });
            }
            if (roleList && roleList.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: " list found",
                    list: roleList,
                });
            } else
                return res
                    .status(201)
                    .json({ success: false, message: " No list found" });
        });
    },
];
