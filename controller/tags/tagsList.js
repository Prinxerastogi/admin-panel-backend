"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    tagsSchema = require("../../sharedmb/schema/tags"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let findTag = (req, res, next) => {
    let conditions = {};
    crudModel.find(conditions, tagsSchema, (err, tags) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (tags != null) {
            return res
                .status(200)
                .json({ success: true, message: `Tags List`, data: tags });
        } else {
            return res
                .status(500)
                .json({ success: true, message: MESSAGE.add.unknown });
        }
    });
};
module.exports = [findTag];
