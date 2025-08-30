"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
  notificationSchema = require("../../sharedmb/schema/notification"),
  validation = require("./validation"),
  validate = require("express-validation"),
  MESSAGE = require("./message");

module.exports = [
  validate(validation.activeDeactive),
  (req, res) => {
    crudModel.updateOne(
      { _id: req.body.notificationId },
      { $set: { isActive: req.body.status } },
      {},
      notificationSchema,
      (err, updated) => {
        if (err) {
          return res.status(400).json({
            error: true,
            success: false,
            message: MESSAGE.activeDeactive.error,
            error: err,
          });
        } else if (updated.n > 0 && updated.modifiedCount > 0) {
          return res.status(200).json({
            success: true,
            message: `notification has been ${req.body.status}`,
          });
        } else {
          return res.status(201).json({
            success: false,
            message: `notification  already is in ${req.body.status}`,
          });
        }
      }
    );
  },
];
