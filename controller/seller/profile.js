"use strict";
let sellerSchema = require("../../sharedmb/schema/seller"),
    crud = require("../../sharedmb/models/crud"),
    validate = require("express-validation"),
    validation = require("./validation"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        let aggregate = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.query.sellerId),
                },
            },
            {
                $lookup: {
                    from: "cities",
                    let: { cityId: "$cities" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", "$$cityId"],
                                },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                                _id: 1,
                            },
                        },
                    ],
                    as: "cities",
                },
            },
        ];
        sellerSchema.aggregate(aggregate, (error, response) => {
            if (error)
                return res.status(400).json({
                    message: MESSAGE.profile.error,
                    error: error,
                    success: false,
                });
            else if (response)
                return res
                    .status(200)
                    .json({ success: true, response: response[0] });
            else
                return res.status(201).json({
                    message: MESSAGE.profile.notfound,
                    success: false,
                });
        });
    },
];
