"use strict";
let supplierSchema = require("../../sharedmb/schema/supplier");

let findSupplier = (req, res, next) => {
  let condition = {
    _id: req.params.supplierId,
  };
  supplierSchema.findOne(condition, (err, supplierRes) => {
    if (err) {
      return res.json({ success: false, isError: true, error: err });
    } else {
      req.data = {};
      req.data.supplier = supplierRes;
      next();
    }
  });
};

let updateSupplierActivate = (req, res) => {
  let condition = {
    _id: req.params.supplierId,
  };
  let update = {
    $set: {
      isApprove: !req.data.supplier.isApprove,
    },
  };
  supplierSchema.updateOne(condition, update, (err, response) => {
    if (err) {
      return res.json({
        success: false,
        message: "error occurred in update",
        error: err,
      });
    } else if (response.n == 1 && response.modifiedCount == 1) {
      return res.json({
        success: true,
        message: `supplier ${
          !req.data.supplier.isApprove ? "approved" : "rejected"
        }`,
      });
    } else {
      return res.json({ success: false, message: "supplier not found" });
    }
  });
};

module.exports = [findSupplier, updateSupplierActivate];
