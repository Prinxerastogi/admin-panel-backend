let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/setting");

module.exports = [
    (req, res) => {
        let condition = {};
        crud.findOne(condition, schema, (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error in setting list",
                    error: err,
                });
            } else if (!response || response == null) {
                return res
                    .status(202)
                    .json({ success: false, message: "no data found" });
            } else {
                return res.status(200).json({
                    success: true,
                    message: `setting found`,
                    setting: response,
                });
            }
        });
    },
];
