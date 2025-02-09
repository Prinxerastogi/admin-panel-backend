"use strict";
let supplierSchema = require("../../sharedmb/schema/supplier");

let getSupplierList = (req, res) => {
    let conditions = [
        {
            $sort: {
                created: -1,
            },
        },
    ];
    supplierSchema.aggregate(conditions, (err, supplierListRes) => {
        if (err) {
            return res.json({
                success: false,
                message: "error occurred",
                isError: true,
                error: err,
            });
        } else if (supplierListRes.length > 0) {
            return res.json({
                success: true,
                message: "suppliers found",
                supplierList: supplierListRes,
            });
        } else {
            return res.json({
                success: false,
                message: "no suppliers found",
                supplierList: supplierListRes,
            });
        }
    });
};

module.exports = [getSupplierList];
