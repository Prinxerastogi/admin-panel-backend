"use script";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    gstSchema = require("../../sharedmb/schema/gst"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

module.exports = [
    validate(validation.update),
    (req, res) => {
        let condition = {
                _id: req.body.gstId,
            },
            update = {
                $set: req.body,
            },
            option = {};
        crudModel.updateOne(
            condition,
            update,
            option,
            gstSchema,
            (err, response) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: MESSAGE.update.error,
                        error: err,
                    });
                } else if (response.n > 0 && response.nModified > 0) {
                    return res.status(200).json({
                        success: true,
                        message: MESSAGE.update.updated,
                    });
                } else {
                    return res.status(201).json({
                        success: true,
                        message: MESSAGE.update.already,
                    });
                }
            }
        );
    },
];
