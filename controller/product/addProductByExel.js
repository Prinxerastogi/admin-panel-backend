"use strict";
let crud = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  categorySchema = require("../../sharedmb/schema/category"),
  config = require("config"),
  async = require("async"),
  mongoose = require("mongoose"),
  fs = require("fs-extra"),
  validate = require("express-validation"),
  validation = require("./validation"),
  imageSchema = require("../../sharedmb/schema/image"),
  underscore = require("underscore"),
  utility = require("../../sharedmb/utility/utility"),
  MESSAGE = require("./message");

// var cars = [
//     {
//         'make': 'audi',
//         'model': 'r8',
//         'year': '2012'
//     }, {
//         'make': 'audi',
//         'model': 'rs5',
//         'year': '2013'
//     }, {
//         'make': 'ford',
//         'model': 'mustang',
//         'year': '2012'
//     }, {
//         'make': 'ford',
//         'model': 'fusion',
//         'year': '2015'
//     }, {
//         'make': 'kia',
//         'model': 'optima',
//         'year': '2012'
//     },
// ];

// var grouped = underscore.map(underscore.groupBy(cars, 'make'),
//     clist => clist.map(car => underscore.omit(car, 'make')));

// console.log(grouped);

// let productData = underscore.groupBy(cars, function (data) {
//     return data.make;
// });

//console.log(productData)

//let insertData = [];

// let testa = underscore.each(productData, (ele, i) => {
//     ele.map((_, i) => {
//         _ = _.productDetails;
//         insertData.push({
//             name: _.productName.toLowerCase(),
//             _name: utility.removeSpecialCharAndDash(_.productName),
//             description: _.description ? _.description : null,
//             lDescription: _.description ? utility.removeSpecialChar(_.description) : null,
//             shortDesc: _.shortDesc ? _.shortDesc : null,
//             lShortDesc: _.shortDesc ? utility.removeSpecialChar(_.shortDesc) : null,
//             urlKey: _.urlKey,
//             sellPrice: _.price,
//             price: _.mrp,
//            // sku: req.data.code + productSKUlastDigits(req.data.productSku + i),
//             //mbSku: req.data.code + productSKUlastDigits(req.data.productSku + i),
//             // skuDescription: _.skuDescription,
//             sizeUnit: _.sizeUnit ? _.sizeUnit : null,
//             size: _.size ? _.size : null,
//             'brand.name': _.brandName ? _.brandName.split('-')[1] : null,
//             'brand.id': (_.brandName) ? new mongoose.Types.ObjectId(_.brandName.split('-')[0]) : null,
//             'subBrand.name': _.subBrand ? _.subBrand.split('-')[1] : null,
//             'subBrand.id': (_.subBrand) ? new mongoose.Types.ObjectId(_.subBrand.split('-')[0]) : null,
//             shipping: _.shipping ? _.shipping : null,
//             seo: _.seo ? _.seo : null,
//             'addedBy.id': new mongoose.Types.ObjectId(req.decoded.id),
//             'addedBy.type': 'admin',
//             categoryId: new mongoose.Types.ObjectId(_.leafCatName.split('-')[0]),
//             categories: new mongoose.Types.ObjectId(_.leafCatName.split('-')[0]),
//             images: [],
//             hsnCode: _.hsnCode.toString(),
//             created: new Date().getTime(),
//             updated: new Date().getTime(),
//             date: new Date(),
//             isSubscription: _.isSubscription ? Boolean(_.isSubscription) : false,
//             isOrder: _.isOrder ? Boolean(_.isOrder) : false,
//             membershipPrice: _.membershipPrice ? _.membershipPrice : null,
//             gst: _.gst ? _.gst : null,
//             gstDesc: _.gstDesc ? _.gstDesc : null,
//             recommendedAttribute: _.recommended.name ? _.recommended.name : null,
//             addmore: _.addmore ? _.addmore : null,
//             barCode: _.barCode ? _.barCode : null,
//             isLastBuy: _.isLastBuying ? _.isLastBuying : false,
//             gpId: _.gpId ? Number(_.gpId) : null,
//             gmId: _.gmId ? Number(_.gmId) : null,
//             purchasePrice: _.purchasePrice ? Number(_.purchasePrice) : null

//         })

//     })

// });

let fin1dUrlKey = (req, res, next) => {
  let products = req.body;
  if (
    !products ||
    products == undefined ||
    products.length == 0 ||
    products.length == undefined
  ) {
    return res
      .status(201)
      .json({ success: false, message: "invalid data ", data: req.body });
  }
  next();
};

// let arrangeProductBycategory = (req, res, next) => {
//     let products = req.body;
//     products.map((_, i) => {
//         _.categoryId = new mongoose.Types.ObjectId(_.productDetails.leafCatName.split('-')[0])
//     })

// }

let findProductSku = (req, res, next) => {
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(
          req.body[0].productDetails.leafCatName.split("-")[0]
        ),
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "categoryId",
        as: "products",
      },
    },
    {
      $unwind: {
        path: "$products",
        includeArrayIndex: "0",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        intSku: {
          $toInt: "$products.sku",
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        maxSku: {
          $max: "$intSku",
        },
        code: {
          $first: "$code",
        },
      },
    },
    {
      $addFields: {
        newProductSku: {
          $toString: {
            $cond: [
              "$maxSku",
              {
                $add: ["$maxSku", 1],
              },
              {
                $concat: ["$code", "0001"],
              },
            ],
          },
        },
      },
    },
    {
      $addFields: {
        newProductSku: {
          $toInt: {
            $substr: ["$newProductSku", 6, 4],
          },
        },
      },
    },
  ];
  crud.aggregation(condition, categorySchema, (err, newSku) => {
    if (err) {
      return res
        .status(400)
        .json({
          error: true,
          success: false,
          message: "error in find findProductSku",
          err,
        });
    } else if (newSku.length == 0) {
      return res
        .status(201)
        .json({ success: false, message: "sku not found in this category" });
    } else {
      req.data = {};
      req.data.productSku = newSku[0].newProductSku;
      req.data.code = newSku[0].code;
      next();
    }
  });
};

let productsData = (req, res) => {
  let products = [];
  req.body.map((_, i) => {
    _ = _.productDetails;
    products.push({
      name: _.productName.toLowerCase(),
      _name: utility.removeSpecialCharAndDash(_.productName),
      description: _.description ? _.description : null,
      lDescription: _.description
        ? utility.removeSpecialChar(_.description)
        : null,
      shortDesc: _.shortDesc ? _.shortDesc : null,
      lShortDesc: _.shortDesc ? utility.removeSpecialChar(_.shortDesc) : null,
      urlKey: _.urlKey,
      sellPrice: _.price,
      price: _.mrp,
      sku: req.data.code + productSKUlastDigits(req.data.productSku + i),
      // mbSku: req.data.code + productSKUlastDigits(req.data.productSku + i),
      // skuDescription: _.skuDescription,
      sizeUnit: _.sizeUnit ? _.sizeUnit : null,
      size: _.size ? _.size : null,
      "brand.name": _.brandName ? _.brandName.split("-")[1] : null,
      "brand.id": _.brandName
        ? new mongoose.Types.ObjectId(_.brandName.split("-")[0])
        : null,
      "subBrand.name": _.subBrand ? _.subBrand.split("-")[1] : null,
      "subBrand.id": _.subBrand
        ? new mongoose.Types.ObjectId(_.subBrand.split("-")[0])
        : null,
      shipping: _.shipping ? _.shipping : null,
      seo: _.seo ? _.seo : null,
      "addedBy.id": new mongoose.Types.ObjectId(req.decoded.id),
      "addedBy.type": "admin",
      categoryId: new mongoose.Types.ObjectId(_.leafCatName.split("-")[0]),
      categories: new mongoose.Types.ObjectId(_.leafCatName.split("-")[0]),
      images: [],
      hsnCode: _.hsnCode.toString(),
      created: new Date().getTime(),
      updated: new Date().getTime(),
      date: new Date(),
      isSubscription: _.isSubscription ? Boolean(_.isSubscription) : false,
      isOrder: _.isOrder ? Boolean(_.isOrder) : false,
      membershipPrice: _.membershipPrice ? _.membershipPrice : null,
      gst: _.gst ? _.gst : null,
      gstDesc: _.gstDesc ? _.gstDesc : null,
      recommendedAttribute: _.recommended.name ? _.recommended.name : null,
      addmore: _.addmore ? _.addmore : null,
      barCode: _.barCode ? _.barCode : null,
      isLastBuy: _.isLastBuying ? _.isLastBuying : false,
      gpId: _.gpId ? Number(_.gpId) : null,
      gmId: _.gmId ? Number(_.gmId) : null,
      purchasePrice: _.purchasePrice ? Number(_.purchasePrice) : null,
    });
  });
  crud.createWthOption(products, {}, productSchema, (err, created) => {
    if (err)
      return res
        .status(400)
        .json({
          success: false,
          message: "error occured in product craetion",
          err,
        });
    else if (created) {
      return res
        .status(200)
        .json({
          success: true,
          message: `${products.length} products added`,
          err,
        });
    } else {
      return res
        .status(201)
        .json({ success: false, message: `something went wrong` });
    }
  });
};

let productSKUlastDigits = (index) => {
  switch (index.toString().length) {
    case 1:
      return "000" + index;

    case 2:
      return "00" + index;

    case 3:
      return "0" + index;

    case 4:
    default:
      return index;
  }
};

// function findPriductSku(leafcategoryId) {
//     let condition = [
//         {
//             '$match': {
//                 '_id': new mongoose.Types.ObjectId(leafcategoryId)
//             }
//         }, {
//             '$lookup': {
//                 'from': 'products',
//                 'localField': '_id',
//                 'foreignField': 'categoryId',
//                 'as': 'products'
//             }
//         }, {
//             '$unwind': {
//                 'path': '$products',
//                 'includeArrayIndex': '0',
//                 'preserveNullAndEmptyArrays': true
//             }
//         }, {
//             '$addFields': {
//                 'intSku': {
//                     '$toInt': '$products.sku'
//                 }
//             }
//         }, {
//             '$group': {
//                 '_id': '$_id',
//                 'maxSku': {
//                     '$max': '$intSku'
//                 },
//                 'code': {
//                     '$first': '$code'
//                 }
//             }
//         }, {
//             '$addFields': {
//                 'newProductSku': {
//                     '$toString': {
//                         '$cond': [
//                             '$maxSku', {
//                                 '$add': [
//                                     '$maxSku', 1
//                                 ]
//                             }, {
//                                 '$concat': [
//                                     '$code', '0001'
//                                 ]
//                             }
//                         ]
//                     }
//                 }
//             }
//         }, {
//             '$addFields': {
//                 'newProductSku': {
//                     '$toInt': {
//                         '$substr': [
//                             '$newProductSku', 6, 4
//                         ]
//                     }
//                 }
//             }
//         },
//     ]
//     crud.aggregation(condition, categorySchema, (err, newSku) => {
//         if (err) {
//             return err;

//         }
//         else if (newSku.length == 0) {
//             return 'no sku code';
//         }
//         else {
//             return newSku[0].code;

//         }
//     })
// }

module.exports = [fin1dUrlKey, findProductSku, productsData];
