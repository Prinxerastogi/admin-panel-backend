let schema = require("../../sharedmb/schema/walletTransaction");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
    (req, res) => {
        let condition = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.query.transactionId),
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
                    includeArrayIndex: "index",
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
                    includeArrayIndex: "index",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    date: -1,
                },
            },
        ];
        crud.aggregation(condition, schema, (err, transaction) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in transaction view",
                    err,
                });
            } else if (transaction && transaction.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: ` document found`,
                    transaction: transaction[0],
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: `no document found` });
            }
        });
    },
];
