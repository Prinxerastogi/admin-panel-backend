let schema = require("../../sharedmb/schema/vouchercode"),
    crud = require("../../sharedmb/models/crud");

module.exports = [
    (req, res) => {
        crud.find({}, schema, (err, list) => {
            if (err)
                return res.status(400).json({
                    success: false,
                    message: "error occured in find voucher list",
                    err,
                });
            if (list && list.length > 0) {
                return res
                    .status(200)
                    .json({ success: true, message: "data found", data: list });
            }
            return res
                .status(201)
                .json({ success: false, message: "data  not found" });
        });
    },
];
