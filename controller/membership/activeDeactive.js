"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    membershipSchema = require("../../sharedmb/schema/membership"),
    validation = require("./validation"),
    validate = require("express-validation"),
    MESSAGE = require("./message");

module.exports = [
    validate(validation.activaDeactive),
    (req, res) => {
        crudModel.updateOne(
            { _id: req.body.membershipId },
            { $set: { isActive: req.body.status } },
            {},
            membershipSchema,
            (err, updated) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: MESSAGE.activeDeactive.error,
                        error: err,
                    });
                } else if (updated.n > 0 && updated.nModified > 0) {
                    return res.status(200).json({
                        success: true,
                        message: `membership has been ${req.body.status}`,
                    });
                } else {
                    return res.status(201).json({
                        success: false,
                        message: `membership  already is in ${req.body.status}`,
                    });
                }
            }
        );
    },
];
