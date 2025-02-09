"use strict";
let supplierSchema = require("../../sharedmb/schema/supplier");

let getSupplierList = (req, res) => {
    let conditions = {
        _id: req.params.supplierId,
    };
    supplierSchema.findOne(conditions, (err, supplierListRes) => {
        if (err) {
            return res.json({
                success: false,
                message: "error occurred",
                isError: true,
                error: err,
            });
        } else if (supplierListRes) {
            return res.json({
                success: true,
                message: "supplier found",
                supplierList: supplierListRes,
            });
        } else {
            return res.json({ success: false, message: "No supplier found" });
        }
    });
};

module.exports = [getSupplierList];
