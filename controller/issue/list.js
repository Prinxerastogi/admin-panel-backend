let issueSchema = require("../../sharedmb/schema/reportIssue");
let crudModel = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

let fifndIssueList = (req, res) => {
    let pagination = {
        page: Number(req.query.start),
        limit: Number(req.query.limit),
    };
    let condition = [
        {
            $sort: {
                id: -1,
            },
        },
        {
            $skip: pagination.page * pagination.limit,
        },
        {
            $limit: pagination.limit,
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
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "order",
            },
        },
        {
            $unwind: {
                path: "$order",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    if (req.query.sort && req.query.order) {
        let sort = {};
        sort[req.query.sort] = Number(req.query.order);
        condition[0] = {
            $sort: sort,
        };
    }
    if (req.query.userId) {
        let match = [
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.query.userId),
                },
            },
        ];
        condition = [...match, ...condition];
    }
    crudModel.aggregation(condition, issueSchema, (err, issueList) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in isseus list",
                err,
            });
        } else if (issueList && issueList.length > 0) {
            return res.status(200).json({
                success: true,
                message: `issue list found`,
                issueList,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: `no documents found` });
        }
    });
};

module.exports = [fifndIssueList];
