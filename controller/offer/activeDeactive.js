"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    offerSchema = require("../../sharedmb/schema/offer"),
    validate = require("express-validation"),
    validation = require("./validation");

module.exports = [
    validate(validation.activeDeactive),
    (req, res) => {
        let condition = {
            _id: req.body.offerId,
        };
        let update = {
            $set: {
                isActive: req.body.status,
            },
        };
        let Option = {};
        crudModel.updateOne(
            condition,
            update,
            Option,
            offerSchema,
            (err, updated) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: "error occured in activDeactive offer",
                        error: err,
                    });
                }
                if (req.body.status && updated.n > 0 && updated.nModified > 0) {
                    return res.status(200).json({
                        success: true,
                        message: "promocode activated",
                    });
                } else if (
                    !req.body.status &&
                    updated.n > 0 &&
                    updated.nModified > 0
                ) {
                    return res.status(200).json({
                        success: true,
                        message: "promocode deactivated",
                    });
                }
                return res
                    .status(201)
                    .json({ success: true, message: "unknown status" });
            }
        );
    },
];
