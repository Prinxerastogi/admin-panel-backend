"use strict";
let vendorSchema = require("../../sharedmb/schema/seller"),
  vendorModel = require("../../sharedmb/models/crud"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

module.exports = (req, res) => {
  if (
    req.body.key == "shippingAddress" ||
    req.body.key == "invoiceAddress" ||
    req.body.key == "returnAddress" ||
    req.body.key == "sellerInformation" ||
    req.body.key == "taxInformation" ||
    req.body.key == "bank"
  ) {
    let conditions = {
      _id: req.body.sellerId,
    };
    let key = req.body.key + ".isVerified";
    let update = {
      $set: {
        [key]: req.body.isVerified,
      },
    };
    vendorModel.updateOne(
      conditions,
      update,
      {},
      vendorSchema,
      (error, response) => {
        if (error)
          return res.status(400).json({
            message: MESSAGE.verifyprofile.error,
            error: error,
            success: false,
          });
        else if (response.modifiedCount == 1)
          return res.status(200).json({
            message: MESSAGE.verifyprofile.updated,
            success: true,
          });
        else if (response.modifiedCount == 0)
          return res.status(201).json({
            message: MESSAGE.verifyprofile.alreadyverified,
            success: false,
          });
        else
          return res.status(201).json({
            message: MESSAGE.verifyprofile.unknown,
            success: false,
          });
      }
    );
  } else {
    return res.status(400).json({ message: MESSAGE.verifyprofile.badrequest });
  }
};
