"use strict";
let schema = require("../../sharedmb/schema/admin"),
    crud = require("../../sharedmb/models/crud"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    jwt = require("jsonwebtoken"),
    MESSAGE = require("./message");

let activeDeactive = (req, res) => {
    crud.updateOne(
        { _id: req.body.userId },
        {
            $set: {
                isDeleted: req.body.status,
                updated: new Date().getTime(),
            },
        },
        {},
        schema,
        (err, updated) => {
            if (err)
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "errror occured in  activeDeactive",
                    err,
                });
            else if (updated.n > 0 && updated.nModified > 0) {
                if (req.body.status) {
                    return res.status(200).json({
                        success: true,
                        message: `user has been  inactive state`,
                    });
                }
                if (!req.body.status) {
                    return res.status(200).json({
                        success: true,
                        message: `user has been  active state`,
                    });
                }
            } else {
                if (req.body.status) {
                    return res.status(200).json({
                        success: true,
                        message: `user already  inactive state`,
                    });
                }
                if (!req.body.status) {
                    return res.status(200).json({
                        success: true,
                        message: `user already  active state`,
                    });
                }
            }
        }
    );
};

module.exports = [activeDeactive];
