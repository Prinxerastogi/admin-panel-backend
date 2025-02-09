"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    gstSchema = require("../../sharedmb/schema/gst"),
    MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        let condition = {};
        crudModel.find(condition, gstSchema, (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.list.error,
                    error: err,
                });
            } else if (response.length == 0) {
                return res
                    .status(202)
                    .json({ success: false, message: MESSAGE.list.notfound });
            } else {
                return res.status(200).json({
                    success: true,
                    message: `${response.length} document found`,
                    response: response,
                });
            }
        });
    },
];
