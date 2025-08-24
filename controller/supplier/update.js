let supplierSchema = require("../../sharedmb/schema/supplier");
let mongoose = require("mongoose");
let utility = require("../../sharedmb/utility/utility");
let config = require("config");
let async = require("async");
let fs = require("fs-extra");

let findSupplier = (req, res, next) => {
  supplierSchema.findOne({ _id: req.params.supplierId }, (err, response) => {
    if (err) {
      return res.json({ success: false, isError: true, error: err });
    } else if (response) {
      req.data = {};
      req.data.supplier = response;
      next();
    } else {
      return res.json({ success: true, message: "supplier not found" });
    }
  });
};

let updateSupplier = (req, res, next) => {
  let supplier = req.body;
  let condition = {
    _id: new mongoose.Types.ObjectId(req.params.supplierId),
  };
  let supplierPayload = {
    $set: {
      name: supplier.name,
      address: {
        address1: supplier.address.address1,
        address2: supplier.address.address2,
        landmark: supplier.address.landmark,
        city: supplier.address.city,
        state: supplier.address.state,
        pincode: supplier.address.pincode,
      },
      mobile1: supplier.mobile1,
      mobile2: supplier.mobile2,
      email1: supplier.email1,
      email2: supplier.email2,
      "bank.accountHolderName": supplier.bank.accountHolderName,
      "bank.bankName": supplier.bank.bankName,
      "bank.accountNo": supplier.bank.accountNo,
      "bank.ifsc": supplier.bank.ifsc,
      "bank.accountType": supplier.bank.accountType,
      "bank.branchAddress": supplier.bank.branchAddress,
      brand: supplier.brand.map((_, i) => {
        return {
          name: _.name ? _.name : "",
          brandId: _.brandId ? new mongoose.Types.ObjectId(_.brandId) : null,
        };
      }),
      subBrand: supplier.subBrand.map((_, i) => {
        return {
          name: _.name ? _.name : "",
          subBrandId: _.brandId
            ? new mongoose.Types.ObjectId(_.subBrandId)
            : null,
        };
      }),
      categories: supplier.categories,
      fssai: supplier.fssai,
      gstin: supplier.gstin,
      panNo: supplier.panNo,
      updated: Date.now(),
    },
  };
  supplierSchema.update(condition, supplierPayload, (err, response) => {
    if (err) {
      return res.json({ success: false, isError: true, error: err });
    } else if (
      req.body.bank.cancelCheque &&
      req.body.bank.cancelCheque.length > 0
    ) {
      next();
    } else {
      return res.json({ success: true, message: "supplier updated" });
    }
  });
};

let moveImageOnserver = (req, res, next) => {
  let dstPath = `${config.upload.supplierImagePath}cheque/${req.data.supplier.id}/`;
  async.each(
    req.body.bank.cancelCheque,
    function (image, callback) {
      fs.ensureDir(dstPath, (err) => {
        let srcPath = config.upload.tempPath + image;
        let dstFilePath = dstPath + image;
        fs.move(srcPath, dstFilePath, (err) => {
          if (err) {
            callback({
              error: true,
              success: false,
              message: "error in moving image",
              err,
            });
          } else {
            console.log("success!");
            callback();
          }
        });
      });
    },
    function (err) {
      if (err) {
        return res.status(400).json({
          error: true,
          success: false,
          message: "message.category.update.error.message",
          err,
        });
      } else {
        next();
      }
    }
  );
};

let updateChequeImage = (req, res) => {
  let supplierPayload = {
    $set: {
      "bank.cancelCheque": req.body.bank.cancelCheque,
    },
  };
  supplierSchema.updateOne(
    { _id: new mongoose.Types.ObjectId(req.params.supplierId) },
    supplierPayload,
    (err, response) => {
      if (err) {
        return res.json({ success: false, isError: true, error: err });
      } else {
        return res.json({ success: true, message: "supplier updated" });
      }
    }
  );
};

module.exports = [
  findSupplier,
  updateSupplier,
  moveImageOnserver,
  updateChequeImage,
];
