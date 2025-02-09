let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/setting");

module.exports = [
    (req, res) => {
        let now = new Date().getTime();
        req.body.updated = now;
        let condition = {},
            update = {
                $set: req.body,
            },
            option = {
                upsert: true,
            };
        crud.updateMany(condition, update, option, schema, (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error in update setting",
                    error: err,
                });
            } else if (response.n > 0 && response.nModified > 0) {
                return res
                    .status(200)
                    .json({ success: true, message: "updated successfully." });
            } else {
                return res
                    .status(201)
                    .json({ success: true, message: "already updated" });
            }
        });
    },
];
