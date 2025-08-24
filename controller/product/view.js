"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  mongoose = require("mongoose"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

module.exports = [
  validate(validation.view),
  // (req,res,next)=>{
  //   crudModel.findOne({ _id: req.query.productId }, productSchema, (err, product) => {
  //     if (err) {
  //       return res.status(400).json({ error: true, message: MESSAGE.view.error, error: err });
  //     } else if (product) {
  //       req.categoryId = product.categoryId;
  //       next();
  //     } else {
  //       return res
  //         .status(201)
  //         .json({ success: false, message: MESSAGE.view.notFound });
  //     }
  //   })
  // },
  (req, res) => {
    let condition = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.query.productId),
        },
      },
    ];

    // if (req.categoryId && req.categoryId !== undefined) {
    condition.push(
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "leafCategory",
        },
      },
      {
        $unwind: {
          path: "$leafCategory",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "leafCategory.parentId",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $unwind: {
          path: "$subCategory",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "subCategory.parentId",
          foreignField: "_id",
          as: "rootCategory",
        },
      },
      {
        $unwind: {
          path: "$rootCategory",
        },
      },
      {
        $project: {
          categoryId: 0,
        },
      }
    );
    // }
    crudModel.aggregation(condition, productSchema, (err, product) => {
      if (err) {
        return res.status(400).json({
          error: true,
          message: MESSAGE.view.error,
          error: err,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: `${product.length} product found`,
          product: product[0],
        });
      }
    });
  },
];
