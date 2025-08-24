"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
  categorySchema = require("../../sharedmb/schema/category"),
  mongoose = require("mongoose"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

module.exports = [
  validate(validation.categoryAttributeList),

  (req, res) => {
    let condition = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.query.categoryId),
          isDeleted: false,
          //isActive: true
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "childIds",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $project: {
          subCategory: 1,
        },
      },
      {
        $unwind: {
          path: "$subCategory",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$subCategory",
        },
      },
      {
        $addFields: {
          children: {
            $cond: {
              if: {
                $eq: ["$isLeaf", true],
              },
              then: "",
              else: [{}],
            },
          },
        },
      },
    ];

    crudModel.aggregation(
      condition,
      categorySchema,
      function (error, response) {
        if (error) {
          return res.status(400).json({
            error: true,
            success: false,
            message: MESSAGE.sublist.error,
            error,
          });
        } else if (response && response.length > 0) {
          return res.status(200).json({
            error: false,
            success: true,
            message: MESSAGE.sublist.found,
            category: response,
          });
        } else {
          return res.status(201).json({
            success: false,
            message: MESSAGE.sublist.notfound,
          });
        }
      }
    );
  },
];
