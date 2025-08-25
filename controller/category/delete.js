"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  categorySchema = require("../../sharedmb/schema/category"),
  productSchema = require("../../sharedmb/schema/product"),
  MESSAGE = require("./message"),
  mongoose = require("mongoose");

let checkCategoryInCategories = (req, res, next) => {
  crudModel.findOne(
    // {
    //     $or: [
    //         { parentId: new mongoose.Types.ObjectId(req.query.categoryId) },
    //         { parentIds: new mongoose.Types.ObjectId(req.query.categoryId) },
    //         { childIds: new mongoose.Types.ObjectId(req.query.categoryId) },
    //     ]
    // },
    {
      _id: req.query.categoryId,
    },

    categorySchema,
    (err, category) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error in checkCategoryInCategories ",
          err,
        });
      } else if (category && category.childIds.length > 0) {
        return res.status(201).json({
          success: false,
          message: `category can not be deleted .because It is using in category of ${category.name}`,
          err,
        });
      } else {
        next();
      }
    }
  );
};

let categoryInProduct = (req, res, next) => {
  crudModel.findOne(
    {
      $or: [
        { categoryId: req.query.categoryId },
        { categories: req.query.categoryId },
      ],
    },
    productSchema,
    (err, product) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error in categoryInProduct ",
          err,
        });
      } else if (product) {
        return res.status(201).json({
          success: false,
          message: `category can not be deleted .because It is using in product of ${product.name}`,
          err,
        });
      } else {
        next();
      }
    }
  );
};

let categoryDelete = (req, res, next) => {
  crudModel.updateOne(
    { _id: req.query.categoryId },
    {
      $set: {
        isDeleted: true,
        isActive: false,
      },
    },
    {},
    categorySchema,
    (err, deleted) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error in categoryDelete ",
          err,
        });
      } else if (deleted.n > 0 && deleted.modifiedCount > 0) {
        next();
        //
      } else {
        return res.status(201).json({
          success: false,
          message: "category  already deleted ",
        });
      }
    }
  );
};

let removeChildFromCategory = (req, res) => {
  crudModel.updateMany(
    {},
    {
      $pull: {
        childIds: new mongoose.Types.ObjectId(req.query.categoryId),
      },
    },
    {},
    categorySchema,
    (err, deleted) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error in categoryDelete ",
          err,
        });
      } else if (deleted.n > 0 && deleted.modifiedCount > 0) {
        return res.status(200).json({
          success: true,
          message: "category deleted successfully",
        });
      } else {
        return res.status(201).json({
          success: false,
          message: "category  already deleted ",
        });
      }
    }
  );
};

module.exports = [
  checkCategoryInCategories,
  categoryInProduct,
  categoryDelete,
  removeChildFromCategory,
];
