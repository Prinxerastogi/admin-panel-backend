"use strict";
let mongoose = require("mongoose");
let crudModel = require("../../sharedmb/models/crud"),
    offerSchema = require("../../sharedmb/schema/offer");

module.exports = [
    (req, res) => {
        if (!req.query.offerType) {
            res.send({ message: MESSAGE.offertype.mandate });
        }
        let condition = [
            {
                $match: {
                    offerType: req.query.offerType,
                },
            },
            {
                $sort: {
                    updated: -1,
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
        ];
        crudModel.aggregation(condition, offerSchema, (err, offer) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in find userOffertype",
                    error: err,
                });
            } else if (offer && offer.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: `${offer.length} documents found`,
                    offer: offer,
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: "no ducuments found" });
            }
        });
    },
];
