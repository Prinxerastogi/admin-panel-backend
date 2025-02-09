"use script";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    gstSchema = require("../../sharedmb/schema/gst"),
    MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        let data = req.body;
        crudModel.create(data, gstSchema, (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.add.error,
                    error: err,
                });
            } else if (response == null) {
                return res
                    .status(202)
                    .json({ success: false, message: MESSAGE.add.notsaved });
            } else {
                return res.status(200).json({
                    success: true,
                    message: MESSAGE.add.added,
                    response: response,
                });
            }
        });
    },
];
