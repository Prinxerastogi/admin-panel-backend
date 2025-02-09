let issueSchema = require("../../sharedmb/schema/reportIssue");
let crudModel = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
    //pagination
    (req, res) => {
        let condition = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.query.issueId),
                },
            },
            // {
            //     '$unwind': {
            //         'path': '$productId',
            // 'includeArrayIndex': 'index',
            // 'preserveNullAndEmptyArrays': true
            //     }
            // }, {
            //     '$lookup': {
            //         'from': 'products',
            //         'localField': 'productId',
            //         'foreignField': '_id',
            //         'as': 'product'
            //     }
            // }, {
            //     '$unwind': {
            //         'path': '$product'
            //     }
            //},
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
                $lookup: {
                    from: "sellers",
                    localField: "order.sellerId",
                    foreignField: "_id",
                    as: "seller",
                },
            },
            {
                $unwind: {
                    path: "$seller",
                    includeArrayIndex: "index",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //     '$unwind': {
            //         'path': '$order.product'
            //     }
            // },
            //  {
            //     '$addFields': {
            //         'isMatchProduct': {
            //             '$cmp': [
            //                 '$order.product.productId', '$productId'
            //             ]
            //         }
            //     }
            // }, {
            //     '$match': {
            //         'isMatchProduct': 0
            //     }
            // },
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
                    includeArrayIndex: "yes",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //     '$addFields': {
            //         'product.quantity': '$order.product.quantity'
            //     }
            // },
            // {
            //     '$group': {
            //         '_id': '$_id',
            //         'products': {
            //             '$push': '$product'
            //         },
            //         'user': {
            //             '$first': '$user'
            //         },
            //         'orderId': {
            //             '$first': '$orderId'
            //         },
            //         'description': {
            //             '$first': '$description'
            //         },
            //         'issue': {
            //             '$first': '$issue'
            //         },
            //         'created': {
            //             '$first': '$created'
            //         },
            //         'updated': {
            //             '$first': '$updated'
            //         },
            //         'date': {
            //             '$first': '$date'
            //         },
            //         'email': {
            //             '$first': '$email'
            //         },
            //         'phoneNo': {
            //             '$first': '$phoneNo'
            //         },
            //         'type': {
            //             '$first': '$type'
            //         },
            //         'status': {
            //             '$first': '$status'
            //         }
            //     }
            // }, {
            //     '$lookup': {
            //         'from': 'orders',
            //         'localField': 'orderId',
            //         'foreignField': '_id',
            //         'as': 'order'
            //     }
            // }, {
            //     '$unwind': {
            //         'path': '$order',
            //         'includeArrayIndex': 'index',
            //         'preserveNullAndEmptyArrays': true
            //     }
            // }
        ];
        crudModel.aggregation(condition, issueSchema, (err, issue) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in isseus list",
                    err,
                });
            } else if (issue && issue.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: `${issue.length} documents found`,
                    issue: issue[0],
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: `no documents found` });
            }
        });
    },
];
