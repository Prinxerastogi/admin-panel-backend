"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
  productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
  productSchema = require("../../../sharedmb/schema/product"),
  validate = require("express-validation"),
  validation = require("./validation"),
  mongoose = require("mongoose"),
  MESSAGE = require("./message");

let updateproductid = (req, res, next) => {
  req.data = {};
  let productIds = req.body.productIds;
  if (req.body.productIds.length > 0) {
    var objectIds = productIds.map((_) => {
      return new mongoose.Types.ObjectId(_);
    });
  }
  req.data.objectIds = objectIds;

  crudModel.update(
    { _id: req.body.familyId },
    { $addToSet: { productIds: { $each: objectIds } } },

    {},
    productFamilySchema,
    (err, response) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: MESSAGE.update.error,
          err: err,
        });
      } else if (response.modifiedCount == 0) {
        return res.status(201).json({
          success: false,
          message: MESSAGE.update.Alreadyadded,
        });
      } else {
        next();
        // return res.status(200).json({ success: true, message: MESSAGE.update.added, response: response })
      }
    }
  );
};

let updateFamilyIdInProducts = (req, res) => {
  //_id: { $in: deliveries.map(_ => _._id) }
  let condition = {
      _id: { $in: req.data.objectIds },
    },
    update = {
      $set: {
        productFamilyId: req.body.familyId,
      },
    };
  crudModel.updateMany(condition, update, {}, productSchema, (err, updated) => {
    if (err) {
      return res.status.json({
        error: true,
        message: "erro occured in  updateFamilyIdInProducts",
        err,
      });
    } else if (updated.n > 0 && updated.modifiedCount > 0) {
      return res
        .status(200)
        .json({ success: true, message: MESSAGE.update.added });
    }
  });
};

module.exports = [
  validate(validation.update),
  updateproductid,
  updateFamilyIdInProducts,
];
