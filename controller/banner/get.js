let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/banner");

module.exports = [
    (req, res) => {
        crud.findOne({ _id: req.params.bannerId }, schema, (err, banners) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in banner",
                    err,
                });
            }
            if (banners) {
                return res.status(200).json({
                    success: true,
                    message: " data found",
                    banners: banners,
                });
            } else
                return res
                    .status(201)
                    .json({ success: false, message: " No data found" });
        });
    },
];
