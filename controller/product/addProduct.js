"use strict";
let crud = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  config = require("config"),
  async = require("async"),
  mongoose = require("mongoose"),
  fs = require("fs-extra"),
  validate = require("express-validation"),
  validation = require("./validation"),
  imageSchema = require("../../sharedmb/schema/image"),
  utility = require("../../sharedmb/utility/utility"),
  gm = require("gm").subClass({ imageMagick: true }),
  MESSAGE = require("./message");

let findProduct = (req, res, next) => {
  let conditions = {
    urlKey: utility.removeSpecialCharAndDash(req.body.productDetails.urlKey),
  };
  crud.findOne(conditions, productSchema, (error, response) => {
    if (error)
      return res.status(400).json({
        message: MESSAGE.addproduct.mongoerror,
        success: false,
        error: error,
      });
    else if (response == null) next();
    else
      return res
        .status(201)
        .json({ message: MESSAGE.addproduct.exists, success: false });
  });
};

let moveImagefromTempToServer = require("../image/moveImageFromTempFolder");

//image Move

let copyImageFromTempToServer = (req, res, next) => {
  req.data = {};
  let data = req.body.productDetails;
  let folderName = utility.removeSpecialCharAndDash(data.productName);
  req.data.folderName = folderName;
  let dstPath = `${config.upload.productImagePath}${folderName}/`;
  req.data.dstPath = dstPath;
  req.data.images = [];
  moveImagefromTempToServer(req.body.images, dstPath, (err, results) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "something went wrong copyImageFromTempToServer",
        err,
      });
    } else {
      next();
    }
  });
};

//create variante

let createImageVariantController = require("../image/imageVariant");

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
          message: "error in find product urlkey",
          err,
        });
      } else {
        next();
      }
    }
  );
};

let insertProduct = (req, res, next) => {
  try {
    let productData = req.body.productDetails;
    let data = {
      name: productData.productName.toLowerCase(),
      _name: utility.removeSpecialCharAndDash(productData.productName),
      description: productData.description,
      lDescription: utility.removeSpecialChar(productData.description),
      shortDesc: productData.shortDesc,
      lShortDesc: utility.removeSpecialChar(productData.shortDesc),
      urlKey: utility.removeSpecialCharAndDash(productData.urlKey),
      sellPrice: productData.price,
      price: productData.mrp,
      sku: productData.sku,
      // mbSku: productData.mbSku,
      skuDescription: productData.skuDescription,
      sizeUnit: productData.sizeUnit,
      size: productData.size,
      "brand.name": productData.brandName,
      "brand.id": new mongoose.Types.ObjectId(productData.brandId),
      shipping: req.body.shipping,
      seo: req.body.seo,
      "addedBy.id": new mongoose.Types.ObjectId(req.decoded.id),
      "addedBy.type": "admin",
      categoryId: new mongoose.Types.ObjectId(
        req.body.category.selectCategoryId
      ),
      categories: new mongoose.Types.ObjectId(
        req.body.category.selectCategoryId
      ),
      images: req.body.images,
      hsnCode: productData.hsnCode.toString(),
      created: new Date().getTime(),
      updated: new Date().getTime(),
      date: new Date(),
      isSubscription: productData.isSubscription,
      isOrder: productData.isOrder,
      membershipPrice: productData.membershipPrice,
      gst: productData.gst,
      gstDesc: productData.gstDesc,
      recommendedAttribute: req.body.recommended.name[0],
      addmore: productData.addmore,
      barCode: productData.barCode,
      gpId: productData.gpId ? Number(productData.gpId) : null,
      gmId: productData.gmId ? Number(productData.gmId) : null,
      purchasePrice: productData.purchasePrice
        ? Number(productData.purchasePrice)
        : null,
    };
    // let option = {};
    //  let session = null;
    //productSchema.startSession().then(_session => {
    // session = _session;
    //session.startTransaction();
    //option.session = session;
    crud.create(data, productSchema, (err, response) => {
      if (err) {
        // session.abortTransaction();
        return res.status(400).json({
          error: true,
          success: false,
          message: "error occured in insertProduct",
          error: err,
        });
      } else {
        res.status(200).json({
          success: true,
          message: ` product ${response.name} added successfully`,
        });
        req.data.response = response;

        //req.data.session = session;
        next();
      }
    });
    // })
  } catch (err) {
    // session.abortTransaction();
    return res.status(400).json({
      success: false,
      error: true,
      message: MESSAGE.addproduct.exists,
      error: err,
    });
  }
};

let saveImagePath = (req) => {
  let data = {
    path: config.upload.productImagePath,
    folderName: req.data.folderName,
    images: req.body.images,
    schemaId: req.data.response._id,
    schemaName: "product",
  };
  crud.create(data, imageSchema, function (err, imagePath) {
    if (err) {
      console.log("error : ", err);
      return 1;
    } else {
      return 0;
    }
  });
};

module.exports = [
  validate(validation.addProduct),
  findProduct,
  copyImageFromTempToServer,
  // createImageVariant,
  insertProduct,
  saveImagePath,
];
