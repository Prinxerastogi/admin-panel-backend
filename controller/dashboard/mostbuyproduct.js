"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  orderSchema = require("../../sharedmb/schema/order"),
  mongoose = require("mongoose"),
  validation = require("./validation"),
  MESSAGE = require("./message"),
  validate = require("express-validation");

let sort = (req, res, next) => {
  if (req.query.sort) {
    let string = JSON.parse(req.query.sort);
    let sort = string.sort;
    req.data = {};
    req.data.sort = sort;
    next();
  } else {
    req.data = {};
    req.data.sort = undefined;
    next();
  }
};

let mostBuyProduct = (req, res) => {
  let condition = [
    {
      $match: {
        cityId: new mongoose.Types.ObjectId(req.query.cityId),
      },
    },
    {
      $lookup: {
        from: "sellerproducts",
        localField: "product.productId",
        foreignField: "productId",
        as: "products",
      },
    },
    {
      $unwind: {
        path: "$products",
      },
    },
    {
      $sort: {
        "products.created": -1,
      },
    },
    {
      $match: {
        "products.isActive": true,
        "products.isApproved": true,
        "products.isDeleted": false,
      },
    },
    {
      $lookup: {
        from: "sellers",
        localField: "products.sellerId",
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
      $match: {
        "seller.cities": new mongoose.Types.ObjectId(req.query.cityId),
        "seller.isProfileVerify": true,
        "seller.isActivate": true,
      },
    },
    {
      $project: {
        seller: 0,
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "sellerProduct",
      },
    },
    {
      $unwind: {
        path: "$sellerProduct",
      },
    },
    {
      $addFields: {
        "sellerProduct.quantity": "$products.quantity",
        "sellerProduct.subscriptionQuantity": "$products.subscriptionQuantity",
        "sellerProduct.perUserOrderQuantity": "$products.perUserOrderQuantity",
        "sellerProduct.perUserSubscriptionQuantity":
          "$products.perUserSubscriptionQuantity",
        "sellerProduct.sellerProductId": "$products._id",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$sellerProduct",
      },
    },
    {
      $group: {
        _id: "$_id",
        products: {
          $addToSet: "$$ROOT",
        },
      },
    },
    {
      $unwind: {
        path: "$products",
      },
    },
    {
      $replaceRoot: {
        newRoot: "$products",
      },
    },
    {
      $group: {
        _id: "$_id",
        products: {
          $first: {
            _id: "$_id",
            name: "$name",
            _name: "$_name",
            price: "$price",
            sellPrice: "$sellPrice",
            membershipPrice: "$membershipPrice",
            sellerProductId: "$sellerProductId",
            description: "$description",
            lDescription: "$lDescription",
            shortDesc: "$shortDesc",
            isSubscription: "$isSubscription",
            isOrder: "$isOrder",
            size: "$size",
            sku: "$sku",
            sizeUnit: "$sizeUnit",
            urlKey: "$urlKey",
            images: "$images",
            perUserSubscriptionQuantity: "$perUserSubscriptionQuantity",
            perUserOrderQuantity: "$perUserOrderQuantity",
            subscriptionQuantity: "$subscriptionQuantity",
            quantity: "$quantity",
            categories: "$categories",
            shipping: "$shipping",
            brand: "$brand",
            seo: "$seo",
            recommendedAttribute: "$recommendedAttribute",
            productFamilyId: "$productFamilyId",
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: "$products",
      },
    },
    {
      $addFields: {
        discount: {
          $multiply: [
            {
              $divide: ["$sellPrice", "$price"],
            },
            100,
          ],
        },
      },
    },
    {
      $limit: 5,
    },
  ];

  if (req.query.sort) {
    condition.push({ $sort: sort });
  }

  crudModel.aggregation(condition, orderSchema, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: MESSAGE.mostbuyproduct.error,
        error: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: MESSAGE.mostbuyproduct.found,
        mostBuyProduct: products,
      });
    }
  });
};

module.exports = [validate(validation.cityId), sort, mostBuyProduct];
