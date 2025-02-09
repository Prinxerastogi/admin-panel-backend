let orderSchema = require("../../sharedmb/schema/order");
let moment = require("moment");
const mongoose = require("mongoose");

let findOrders = (req, res) => {
    let condition = [
        {
            $match: {
                offerId: mongoose.Types.ObjectId(req.params.id),
            },
        },
        {
            $addFields: {
                deliveryDate: {
                    $dateFromString: {
                        dateString: "$deliveryDate",
                        onError: "$deliveryDate",
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
                                        dateString: "$deliveryDate",
                                        onError: "$deliveryDate",
                                    },
                                },
                                {
                                    $dateFromString: {
                                        dateString: req.query.from
                                            ? moment(req.query.from).format()
                                            : moment()
                                                  .add(-60, "days")
                                                  .format(),
                                    },
                                },
                            ],
                        },
                        {
                            $lt: [
                                {
                                    $dateFromString: {
                                        dateString: "$deliveryDate",
                                        onError: "$deliveryDate",
                                    },
                                },
                                {
                                    $dateFromString: {
                                        dateString: req.query.to
                                            ? moment(req.query.to).format()
                                            : moment().format(),
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
                                date: "$deliveryDate",
                            },
                        },
                    },
                },
            },
        },
    ];

    let sort = [
        {
            $sort: {
                _id: -1,
            },
        },
        {
            $group: {
                _id: { $dayOfYear: "$deliveryDate" },
                totalCount: { $sum: 1 },
                date: { $first: "$deliveryDate" },
                totalAmount: { $sum: "$amount" },
                promocode: { $first: "$promocode" },
            },
        },
        {
            $group: {
                _id: "",
                usedPromocode: {
                    $push: {
                        name: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                        value: "$totalCount",
                    },
                },
                orders: {
                    $push: {
                        name: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                        value: "$totalAmount",
                    },
                },
                totalAmount: {
                    $sum: "$totalAmount",
                },
                totalPromoCount: { $sum: "$totalCount" },
                promocode: { $first: "$promocode" },
            },
        },
    ];

    condition = [...condition, ...sort];
    orderSchema.aggregate(condition, (err, data) => {
        if (err) {
            res.status(400).send({ err: true, message: err });
        } else if (data.length > 0) {
            res.status(200).send({
                success: true,
                message: "data found",
                data: data[0],
            });
        } else {
            res.status(200).send({ success: false, message: " no data found" });
        }
    });
};

module.exports = [findOrders];
