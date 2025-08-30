"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  categorySchema = require("../../sharedmb/schema/category"),
  mongoose = require("mongoose"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

let findAttributeByCategoryId = (req, res) => {
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.query.categoryId),
        isDeleted: false,
        isActive: true,
      },
    },
    {
      $project: {
        attributes: 1,
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
    {
      $unwind: {
        path: "$attributes",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$attributes",
      },
    },
  ];
  crudModel.aggregation(condition, categorySchema, (err, attribute) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: MESSAGE.list.error,
        error: err,
      });
    } else if (attribute && attribute.length > 0) {
      return res.status(200).json({
        success: true,
        message: ` ${attribute.length} attribute found`,
        attribute: attribute,
      });
    } else {
      return res
        .status(201)
        .json({ success: false, message: MESSAGE.list.notfound });
    }
  });
};

module.exports = [
  validate(validation.categoryAttributeList),
  findAttributeByCategoryId,
];
