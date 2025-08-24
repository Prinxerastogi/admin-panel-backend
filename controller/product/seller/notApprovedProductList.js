"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
  sellerProductSchema = require("../../../sharedmb/schema/sellerProduct"),
  MESSAGE = require("./message");
let mongoose = require("mongoose");

let findSellerAddProductList = (req, res) => {
  let pagination = {
    page: Number(req.query.start),
    limit: Number(req.query.end),
  };
  let condition = [
    {
      $match: {
        isApproved: false,
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: {
        path: "$product",
      },
    },
    {
      $lookup: {
        from: "sellers",
        localField: "sellerId",
        foreignField: "_id",
        as: "seller",
      },
    },
    {
      $unwind: {
        path: "$seller",
      },
    },
    {
      $lookup: {
        from: "cities",
        localField: "seller.cities",
        foreignField: "_id",
        as: "city",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
      },
    },

    {
      $group: {
        _id: null,
        total: {
          $sum: 1,
        },
        products: {
          $push: "$$ROOT",
        },
        sellerId: { $first: "$sellerId" },
      },
    },

    {
      $unwind: {
        path: "$products",
      },
    },
    {
      $addFields: {
        "products.product.total": "$total",
      },
    },
    {
      $addFields: {
        data: {
          city: "$city",
          product: "$products.product",
          category: {
            name: "$products.category.name",
          },
          seller: {
            name: "$products.seller.name",
            email: "$products.seller.email",
          },
          sellerProductId: "$products._id",
          isApproved: "$products.isApproved",
          sellerId: "$products.sellerId",
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$data",
      },
    },

    {
      $sort: { "product.updated": -1 },
    },
  ];

  if (req.query.sellerId) {
    condition.push({
      $match: {
        sellerId: new mongoose.Types.ObjectId(req.query.sellerId),
      },
    });
  }

  if (req.query.start != null && req.query.end != null) {
    condition.push(
      {
        $skip: pagination.page * pagination.limit,
      },
      {
        $limit: pagination.limit,
      }
    );
  }

  crudModel.aggregation(condition, sellerProductSchema, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: MESSAGE.notApprovedlist.error,
        error: err,
      });
    } else if (products && products.length > 0) {
      return res.status(200).json({
        success: true,
        message: `${products.length} products found`,
        products: products,
      });
    } else {
      return res.status(201).json({
        success: false,
        message: MESSAGE.notApprovedlist.notfound,
      });
    }
  });
};

module.exports = [findSellerAddProductList];
