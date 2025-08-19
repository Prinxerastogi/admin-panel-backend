"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  validate = require("express-validation"),
  validation = require("./validation"),
  mongoose = require("mongoose");

let getProducts = (req, res, next) => {
  let pagination = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
  };
  let value = req.query.keyword ? req.query.keyword : null;

  let aggregate = [];

  let filter = {};

  if (req.query.rootCategoryId) {
    if (aggregate.length <= 0) {
      aggregate.push(
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
          $match: {
            "subCategory.parentId": mongoose.Types.ObjectId(req.query.rootCategoryId),
          },
        }
      );
    } else {
      filter["subCategory.parentId"] = mongoose.Types.ObjectId(req.query.rootCategoryId);
    }
  }
  if (req.query.leafCategoryId) {
    filter["leafCategory._id"] = mongoose.Types.ObjectId(req.query.leafCategoryId);
  }
  if (req.query.subCategoryId) {
    filter["subCategory._id"] = mongoose.Types.ObjectId(req.query.subCategoryId);
  }
  if (req.query.subBrandId) {
    filter["subBrand.id"] = mongoose.Types.ObjectId(req.query.subBrandId);
  } else if (req.query.brandId) {
    filter["brand.id"] = mongoose.Types.ObjectId(req.query.brandId);
  }
  if (req.query.isActive) {
    filter["isActive"] = req.query.isActive == "true" ? true : false;
  }
  if (req.query.isMorningBuy) {
    filter["isMorningBuy"] = req.query.isMorningBuy == "true" ? true : false;
  }
  if (req.query.isHold) {
    filter["isHold"] = req.query.isHold == "true" ? true : false;
  }
  if (req.query.isSubscription) {
    filter["isSubscription"] = req.query.isSubscription == "true" ? true : false;
  }
  console.log("filter", req.query);
  if (req.query.faq) {
    filter["faq"] = req.query.faq === "false" ? { $eq: null } : { $ne: null };
  }
  if (req.query.usage) {
    filter["howToUse"] = req.query.usage === "false" ? { $eq: null } : { $ne: null };
  }
  if (req.query.benefits) {
    filter["benefits"] = req.query.benefits === "false" ? { $eq: null } : { $ne: null };
  }
  if (req.query.nutrition) {
    filter["nutritionalFacts"] = req.query.nutrition === "false" ? { $eq: null } : { $ne: null };
  }
  aggregate.push({
    $match: filter,
  });

  let search = {
    $match: {
      $and: [
        {
          $or: [
            { barCode: { $regex: value } },
            { sku: { $regex: value } },
            { name: { $regex: value } },
            { _name: { $regex: value } },
            { description: { $regex: value } },
            { shortDesc: { $regex: value } },
            { lShortDesc: { $regex: value } },
            { lDescription: { $regex: value } },
            { "seo.metaKeywords": { $regex: value } },
          ],
        },
      ],
    },
  };

  if (value) {
    aggregate.push(search);
  }
  aggregate.push({
    $addFields: {
      imageCount: {
        $cond: {
          if: { $isArray: "$images" },
          then: { $size: "$images" },
          else: 0
        }
      }
    }
  });

  let paginate = [
    {
      $project: {
        subCategory: 0,
        leafCategory: 0,
      },
    },
    {
      $addFields: {
        newProductSku: {
          $convert: {
            input: "$sku",
            to: "int",
            onError: "An error occurred",
            onNull: "Input was null or empty",
          },
        },
      },
    }
  ];

  if (req.query.images === "true") {
    paginate.push({
      $sort: {
        imageCount: 1,
        newProductSku: 1,
      },
    });
  } else {
    paginate.push({
      $sort: {
        newProductSku: 1,
      },
    });
  }

  paginate.push(
    {
      $skip: pagination.page * pagination.limit,
    },
    {
      $limit: pagination.limit,
    },
    {
      $match: {
        isParent: true,
      },
    }
  );

  aggregate = [...aggregate, ...paginate];
  crudModel.aggregation(aggregate, productSchema, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "error in product finding product list",
        error: err.message,
      });
    } else if (products && products.length > 0) {
      return res.status(200).json({
        success: true,
        message: "product found",
        products: products,
      });
    } else {
      return res.status(201).json({ success: false, message: "no product found" });
    }
  });
};

module.exports = [getProducts];
