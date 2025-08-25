"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
  citySchema = require("../../sharedmb/schema/city"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

let activeDeactiveCity = (req, res) => {
  let condition = { _id: req.body.cityId },
    update = {
      isActive: req.body.value,
    },
    option = {};

  crudModel.updateOne(condition, update, option, citySchema, (err, updated) => {
    if (err) {
      return res.status(400).json({
        message: MESSAGE.actdeact.error,
        error: err,
        success: false,
      });
    } else if (updated.modifiedCount > 0 && updated.n > 0) {
      return res.status(201).json({
        success: false,
        message: ` city ${req.body.value} is updated`,
      });
    } else {
      return res.status(201).json({ message: MESSAGE.actdeact.updated });
    }
  });
};
module.exports = [validate(validation.activeDeactve), activeDeactiveCity];
