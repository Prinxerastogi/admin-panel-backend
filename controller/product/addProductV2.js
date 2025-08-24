"use strict";
let crud = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  categorySchema = require("../../sharedmb/schema/category"),
  config = require("config"),
  async = require("async"),
  mongoose = require("mongoose"),
  validate = require("express-validation"),
  validation = require("./validation"),
  utility = require("../../sharedmb/utility/utility"),
  moveImagefromTempToServer = require("../image/moveImageFromTempFolder"),
  createImageVariantController = require("../image/imageVariant"),
  panelTrack = require("../../sharedmb/schema/panelTack");

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
let checkHsnCode = (req, res, next) => {
  console.log("Checking HSN code:", req.decoded);
  if (!req.body.hsnCode) {
    return res.status(400).json({
      success: false,
      message: "HSN code is mandatory",
    });
  }

  let hsnCode = req.body.hsnCode.toString();

  if (!/^10\d{6}$/.test(hsnCode)) {
    return res.status(400).json({
      success: false,
      message: "HSN code must be 8 digits starting with '10'",
    });
  }

  productSchema.findOne({ hsnCode: hsnCode }, (err, product) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Error checking HSN code",
        err,
      });
    }

    if (product) {
      return res.status(400).json({
        success: false,
        message: "HSN code already exists for another product",
        existingProduct: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
        },
      });
    }

    next();
  });
};
let findProductSku = (req, res, next) => {
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.body.leafCatId),
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
    //  {
    //     '$addFields': {
    //         'intSku': {
    //             '$toInt': '$products.sku'
    //         }
    //     }
    // }, {
    //     '$group': {
    //         '_id': '$_id',
    //         'maxSku': {
    //             '$max': '$intSku'
    //         },
    //         'code': {
    //             '$first': '$code'
    //         }
    //     }
    // },
    // {
    //     '$addFields': {
    //         'newProductSku': {
    //             '$toString': {
    //                 '$cond': [
    //                     '$maxSku', {
    //                         '$add': [
    //                             '$maxSku', 1
    //                         ]
    //                     }, {
    //                         '$concat': [
    //                             '$code', '0001'
    //                         ]
    //                     }
    //                 ]
    //             }
    //         }
    //     }
    // }, {
    //     '$addFields': {
    //         'newProductSku': {
    //             '$toInt': {
    //                 '$substr': [
    //                     '$newProductSku', 6, 4
    //                 ]
    //             }
    //         }
    //     }
    // },
  ];
  crud.aggregation(condition, categorySchema, (err, newSku) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "error in find findProductSku",
        err,
      });
    } else if (newSku.length == 0) {
      return res.status(201).json({
        success: false,
        message: "sku not found in this category",
      });
    } else {
      req.data = {};
      req.data.productSku = req.body.barCode;
      req.data.code = "";
      // req.data.productSku = newSku[0].newProductSku;
      // req.data.code = newSku[0].code;
      next();
    }
  });
};

let findBarcodeAndSKU = (req, res, next) => {
  let condition;
  if (req.body.barCode) {
    condition = {
      $or: [
        {
          sku: req.data.code + productSKUlastDigits(req.data.productSku),
        },
        {
          barCode: req.body.barCode,
        },
      ],
    };
  } else {
    condition = {
      $or: [
        {
          sku: req.data.code + productSKUlastDigits(req.data.productSku),
        },
      ],
    };
  }
  productSchema.find(condition, (err, response) => {
    if (err)
      return res.status(400).json({
        success: false,
        message: "error occured in matching sku and barcode",
        err: err,
      });
    else if (response.length == 0) {
      next();
    } else {
      return res.status(200).json({
        success: false,
        message: "sku or barcode already exhist",
        products: response,
      });
    }
  });
};

let createProduct = (req, res, next) => {
  let product = req.body;
  let insert = {
    name: product.name.toLowerCase(),
    _name: utility.removeSpecialCharAndDash(product.name.toLowerCase()),
    description: product.description ? product.description : null,
    lDescription: product.description
      ? utility.removeSpecialChar(product.description)
      : null,
    shortDesc: product.shortDesc ? product.shortDesc : null,
    lShortDesc: product.shortDesc
      ? utility.removeSpecialChar(product.shortDesc)
      : null,
    urlKey: product.urlKey,
    sellPrice: product.price,
    price: product.mrp,
    sku: req.data.code + productSKUlastDigits(req.data.productSku),
    // mbSku: req.data.code + productSKUlastDigits(req.data.productSku),
    brand: {
      name: product.brand.name ? product.brand.name : null,
      id: product.brand._id
        ? new mongoose.Types.ObjectId(product.brand._id)
        : null,
    },
    subBrand: {
      name: product.subBrand.name ? product.subBrand.name : null,
      id: product.subBrand._id
        ? new mongoose.Types.ObjectId(product.subBrand._id)
        : null,
    },
    shipping: product.shipping ? product.shipping : null,
    seo: product.seo ? product.seo : null,
    addedBy: {
      id: new mongoose.Types.ObjectId(req.decoded.id),
      type: "admin",
    },
    categoryId: new mongoose.Types.ObjectId(product.leafCatId),
    categories: new mongoose.Types.ObjectId(product.leafCatId),
    images: [],
    hsnCode: product.hsnCode.toString(),
    created: new Date().getTime(),
    updated: new Date().getTime(),
    date: new Date(),
    isSubscription: product.isSubscription ? true : false,
    isOrder: product.isOrder ? true : false,
    isMorningBuy: product.isMorningBuy ? true : false,
    membershipPrice: product.membershipPrice,
    gst: product.gst,
    gstDesc: product.gstDesc ? product.gstDesc : null,
    recommendedAttribute: product.recommendedAttribute
      ? product.recommendedAttribute
      : null,
    barCode: product.barCode
      ? product.barCode
      : req.data.code + productSKUlastDigits(req.data.productSku),
    isLastBuy: product.isLastBuying ? true : false,
    purchasePrice: product.purchasePrice,
    minSellPrice: product.minSellPrice,
    parentId: req.body.parentId
      ? new mongoose.Types.ObjectId(req.body.parentId)
      : null,
    isParent: req.body.isParent,
  };

  const newProd = new productSchema(insert);
  newProd
    .save()
    .then((created) => {
      if (created) {
        req.data = {};
        req.data.product = created;
        panelTrack.create({
          adminId: req.decoded.id,
          message: `New product created by ${req.decoded.role}`,
          type: "productCreate",
          productId: created._id,
          data: {
            name: created.name,
            sku: created.sku,
            hsnCode: created.hsnCode,
            price: created.price,
            sellPrice: created.sellPrice,
            purchasePrice: created.purchasePrice,
            minSellPrice: created.minSellPrice,
            categoryId: created.categoryId,
            brand: created.brand,
            isSubscription: created.isSubscription,
            isOrder: created.isOrder,
            isMorningBuy: created.isMorningBuy,
          },
        });
        next();
      } else {
        return res.status(201).json({
          success: false,
          message: `something went wrong`,
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        message: "error occured in product craetion",
        err,
      });
    });
};

let copyImageFromTempToServer = (req, res, next) => {
  let product = req.data.product;
  let folderName = product.id;
  req.data.folderName = folderName;
  let dstPath = `${config.upload.productImagePath}${folderName}/`;
  req.data.dstPath = dstPath;
  moveImagefromTempToServer(req.body.images, dstPath, (err, results) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "something went wrong  ",
        err,
      });
    } else {
      next();
    }
  });
};

let createImageVariant = (req, res, next) => {
  async.each(
    req.body.images,
    (image, callback) => {
      createImageVariantController(req.data.dstPath, image, (err, result) => {
        if (err) {
          callback({
            error: true,
            success: false,
            message: "error in createImageVariant",
            err,
          });
        } else {
          callback();
        }
      });
    },
    (err) => {
      if (err) {
        return res.status(400).json({
          error: true,
          success: false,
          message: "error in createImageVariant",
          errMsg: err.message,
        });
      } else {
        next();
      }
    }
  );
};

let updateImages = (req, res, next) => {
  crud.updateOne(
    { _id: req.data.product._id },
    {
      $push: {
        images: { $each: req.body.images },
      },
    },
    {},
    productSchema,
    (err, updated) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: "something went wrong in updating images",
          err,
        });
      } else {
        panelTrack.create({
          adminId: req.decoded.id,
          message: `Product images added by ${req.decoded.role}`,
          type: "productImageUpdate",
          productId: req.data.product._id,
          data: {
            imagesCount: req.body.images.length,
            images: req.body.images,
          },
        });
        if (!req.body.isParent) {
          next();
        } else {
          return res.status(200).json({
            success: true,
            message: "product added successfully",
            response: req.data.product._id,
          });
          // for updating child products array with parent product id
          // let condition = {
          //     _id:req.data.product._id
          // }

          // let payload = {
          //     $push:{
          //         childProducts:{
          //             productId:new mongoose.Types.ObjectId(req.data.product._id),
          //             recommendedAttribute: req.body.recommendedAttribute ? req.body.recommendedAttribute : null,
          //         }
          //     }
          // }
          // productSchema.updateOne(condition,payload,(err,response)=>{
          //     if(err){
          //         res.status(400).json({ success: false, message: 'something went wrong in child product', err });
          //     }
          //     else{
          //         return res.status(200).json({ success: true, message: 'product added successfully', response: req.data.product._id });
          //     }
          // })
        }
      }
    }
  );
};

let findParentProduct = (req, res, next) => {
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.body.parentId),
      },
    },
  ];
  productSchema.aggregate(condition, (err, response) => {
    if (err) {
      return res.status(400).json({
        err: true,
        message: "something went wrong in find parentproduct",
        errMsg: err.message,
      });
    } else if (response.length <= 0) {
      return res.status(200).json({
        success: false,
        message: "unable to find parent product",
      });
    } else {
      req.data.parentProduct = response[0];
      next();
    }
  });
};

let checkIsParentExistInChildProducts = (req, res, next) => {
  let condition = [
    {
      $match: {
        $expr: {
          $in: [req.data.parentProduct._id, "$childProducts.productId"],
        },
      },
    },
  ];

  productSchema.aggregate(condition, (err, response) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: "something went wrong in checkIsParentExistInChildProducts",
        errMsg: err.message,
      });
    } else if (response.length > 0) {
      req.data.isParentExistInChildProductsArray = true;
      next();
    } else {
      req.data.isParentExistInChildProductsArray = false;
      next();
    }
  });
};

let updateParentProduct = (req, res) => {
  let condition = {
    _id: req.body.parentId,
  };
  let payload = {};

  if (req.data.isParentExistInChildProductsArray) {
    payload = {
      $push: {
        childProducts: {
          productId: new mongoose.Types.ObjectId(req.data.product._id),
          sellPrice: req.body.price,
          recommendedAttribute: req.body.recommendedAttribute
            ? req.body.recommendedAttribute
            : null,
        },
      },
    };
  } else {
    payload = {
      $set: {
        childProducts: [
          {
            productId: new mongoose.Types.ObjectId(req.data.parentProduct._id),
            sellPrice: req.body.price,
            recommendedAttribute: req.data.parentProduct.recommendedAttribute
              ? req.data.parentProduct.recommendedAttribute
              : null,
          },
          {
            productId: new mongoose.Types.ObjectId(req.data.product._id),
            sellPrice: req.body.price,
            recommendedAttribute: req.body.recommendedAttribute
              ? req.body.recommendedAttribute
              : null,
          },
        ],
      },
    };
  }

  productSchema.updateOne(condition, payload, (err, response) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: "something went wrong in child product",
        err,
      });
    } else if (response.nModified > 0) {
      panelTrack.create({
        adminId: req.decoded.id,
        message: `Child product added to parent product by ${req.decoded.role}`,
        type: "productRelationUpdate",
        productId: req.data.product._id,
        data: {
          childProductId: req.data.product._id,
          parentProductId: req.body.parentId,
          relationType: "child-parent",
        },
      });
      return res.status(200).json({
        success: true,
        message: "product added successfully",
        response: req.data.product._id,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "unable to update child product",
      });
    }
  });
};

module.exports = [
  validate(validation.addProduct),
  checkHsnCode,
  findProductSku,
  findBarcodeAndSKU,
  createProduct,
  copyImageFromTempToServer,
  // createImageVariant,
  updateImages,
  findParentProduct,
  checkIsParentExistInChildProducts,
  updateParentProduct,
];
