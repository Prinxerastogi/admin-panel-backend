"use strict";
let catagorySchema = require("../../sharedmb/schema/category"),
  crud = require("../../sharedmb/models/crud"),
  mongoose = require("mongoose"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");
let getAllAttribute = (req, res, next) => {
  let aggregate = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.query.id),
        isDeleted: false,
        // isActive: true
      },
    },
    {
      $lookup: {
        from: "attributes",
        localField: "attributes",
        foreignField: "_id",
        as: "attributes",
      },
    },
  ];
  crud.aggregation(aggregate, catagorySchema, (error, response) => {
    if (error)
      return res
        .status(400)
        .json({ message: MESSAGE.getattribute.error, error: error });
    else if (response.length > 0)
      return res.status(200).json({
        success: true,
        response: response,
        message: MESSAGE.getattribute.found,
      });
    else
      return res.status(201).json({
        success: false,
        message: MESSAGE.getattribute.notfound,
      });
  });
};

module.exports = [validate(validation.getAttributeOfCategory), getAllAttribute];
