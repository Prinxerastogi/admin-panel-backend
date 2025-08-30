"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  mongoose = require("mongoose"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

module.exports = [
  validate(validation.productId),
  (req, res) => {
    if (!req.body.productId) {
      return res
        .status(400)
        .json({ success: false, message: MESSAGE.hold.sendProductid });
    }
    let condition = { _id: req.body.productId };
    let update = {
      $set: {
        isHold: true,
        updated: new Date().getTime(),
      },
    };
    let option = {};
    crudModel.updateOne(
      condition,
      update,
      option,
      productSchema,
      (err, updated) => {
        if (err) {
          return res.status(400).json({
            error: true,
            message: MESSAGE.hold.error,
            success: false,
            error: err,
          });
        } else if (updated.modifiedCount > 0 && updated.n > 0) {
          return res
            .status(200)
            .json({ success: true, message: MESSAGE.hold.onhold });
        } else {
          return res.status(201).json({
            success: false,
            message: MESSAGE.hold.alreadyhold,
          });
        }
      }
    );
  },
];
