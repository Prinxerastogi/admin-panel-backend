let crudModel = require("../../sharedmb/models/crud"),
    apkSchema = require("../../sharedmb/schema/apk");

module.exports = [
    (req, res) => {
        crudModel.findOne({ _id: req.params.apkId }, apkSchema, (err, apk) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in findadminapk",
                    err,
                });
            }
            if (apk) {
                return res
                    .status(200)
                    .json({ success: true, message: " data found", apk: apk });
            } else
                return res
                    .status(201)
                    .json({ success: false, message: " No data found" });
        });
    },
];
