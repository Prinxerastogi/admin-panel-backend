"use strict";
let attributeSchema = require("../../sharedmb/schema/attribute"),
  crud = require("../../sharedmb/models/crud"),
  validation = require("./validation"),
  validate = require("express-validation"),
  MESSAGE = require("./message");

let checkAttribute = (req, res, next) => {
  let conditions = {
    name: req.body.name,
  };
  crud.findOne(conditions, attributeSchema, (error, response) => {
    if (error)
      return res.status(400).json({
        success: false,
        message: MESSAGE.updateattribute.mongoerror,
        error: error,
      });
    else if (response == null) next();
    else
      return res.status(201).json({
        success: false,
        message: MESSAGE.updateattribute.updatefail,
      });
  });
};

let updateAttribute = (req, res) => {
  let conditions = {
    _id: req.body.id,
  };
  let update = {
    $set: {
      name: req.body.name,
      type: req.body.type,
      values: req.body.values,
      code: req.body.code,
      updated: new Date().getTime(),
      defaultValue: req.body.defaultValue,
    },
  };
  let options = {};
  crud.updateOne(
    conditions,
    update,
    options,
    attributeSchema,
    (error, response) => {
      if (error)
        return res.status(400).json({
          success: false,
          message: MESSAGE.updateattribute.mongoerror1,
          error: error,
        });
      else if (response.modifiedCount == 1)
        return res.status(200).json({
          success: true,
          message: MESSAGE.updateattribute.updated,
          response,
        });
      else
        return res.status(201).json({
          success: false,
          message: MESSAGE.updateattribute.fail,
        });
    }
  );
};

module.exports = [
  // checkAttribute,
  validate(validation.update),
  updateAttribute,
];
