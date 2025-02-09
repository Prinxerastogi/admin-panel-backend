let schema = require("../../sharedmb/schema/vouchercode"),
    crud = require("../../sharedmb/models/crud");

module.exports = [
    (req, res) => {
        crud.updateOne(
            { _id: req.body.voucherId },
            {
                $set: req.body,
            },
            {},
            schema,
            (err, updated) => {
                if (err)
                    return res.status(400).json({
                        success: false,
                        message: "error occured in  updated voucher",
                        err,
                    });
                if (updated.n > 0 && updated.nModified == 1) {
                    return res.status(200).json({
                        success: true,
                        message: "update successfully",
                    });
                }
                return res
                    .status(201)
                    .json({ success: false, message: "already updated" });
            }
        );
    },
];
