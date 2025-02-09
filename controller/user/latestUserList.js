let schema = require("../../sharedmb/schema/user");
let crud = require("../../sharedmb/models/crud");

module.exports = [
    (req, res) => {
        let pagination = {
            page: Number(req.query.start),
            limit: Number(req.query.limit),
        };
        crud.aggregation(
            [
                {
                    $match: {
                        $or: [{ isEmailVerify: true }, { isPhoneVerify: true }],
                    },
                },
                {
                    $sort: {
                        created: -1,
                    },
                },
                {
                    $skip: pagination.page * pagination.limit,
                },
                {
                    $limit: pagination.limit,
                },
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
            ],
            schema,
            (err, users) => {
                if (err)
                    return res
                        .status(400)
                        .json({ message: "error occured in userlist", err });
                else if (users && users.length > 0)
                    return res.status(200).json({
                        success: true,
                        message: "list found",
                        users: users,
                    });
                return res.status(201).json({
                    success: false,
                    message: "user list  not found",
                    I,
                });
            }
        );
    },
];
