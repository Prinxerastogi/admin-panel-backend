"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
  membershipSchema = require("../../sharedmb/schema/membership"),
  validation = require("./validation"),
  validate = require("express-validation"),
  MESSAGE = require("./message");

module.exports = [
  validate(validation.update),
  (req, res) => {
    let condition = {
        _id: req.body.membershipId,
      },
      update = {
        $set: req.body,
      },
      option = {};
    crudModel.updateOne(
      condition,
      update,
      option,
      membershipSchema,
      (err, response) => {
        if (err) {
          return res.status(400).json({
            error: true,
            success: false,
            message: MESSAGE.update.error,
            error: err,
          });
        } else if (response.n > 0 && response.modifiedCount > 0) {
          return res.status(200).json({
            success: true,
            message: MESSAGE.update.updated,
          });
        } else {
          return res.status(201).json({
            success: true,
            message: MESSAGE.update.already,
          });
        }
      }
    );
  },
];
