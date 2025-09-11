"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  validate = require("express-validation"),
  validation = require("./validation"),
  seller = require("../../sharedmb/schema/seller"),
  utility = require("../../sharedmb/utility/utility"),
  config = require("config"),
  MESSAGE = require("./message"),
  sellerProductSchema = require("../../sharedmb/schema/sellerProduct"),
  sellerSchema = require("../../sharedmb/schema/seller"),
  categorySchema = require("../../sharedmb/schema/category"),
  sellerBrandSchema = require("../../sharedmb/schema/sellerBrand"),
  panelTrack = require("../../sharedmb/schema/panelTack"),
  mongoose = require("mongoose");

//sens email when the seller Aproved proved.

let activeDeactive = (req, res, next) => {
  console.log("I am at step 0");
  let condition = {
    _id: req.body.productId,
  };
  let update = {
    $set: {
      isActive: req.body.status,
      updated: new Date().getTime(),
      verification: {
        isImageVerify: true,
        isproductDetailVerify: true,
        isApproved: true,
      },
    },
  };
  let option = {};
  crudModel.findOneAndUpdate(
    condition,
    update,
    option,
    productSchema,
    (err, updated) => {
      if (err) {
        return res.status(400).json({
          error: true,
          success: false,
          message: MESSAGE.activeDeactive.error,
          error: err,
        });
      } else if (updated) {
        req.data = {};
        req.data.product = updated;
        panelTrack.create({
          userId: req.decoded.id,
          userType:"admin",
          message: `Product ${
            req.body.status ? "activated" : "deactivated"
          } by ${req.decoded.role}`,
          type: req.body.status ? "productActivate" : "productDeactivate",
          productId: req.body.productId,
          data: {
            previousStatus: updated.isActive,
            newStatus: req.body.status,
            verification: {
              isImageVerify: true,
              isproductDetailVerify: true,
              isApproved: true,
            },
          },
        });
        if (req.body.status) next();
        else return res.json({ success: true, message: "Product deactivated" });
      } else {
        return res.status(201).json({
          success: false,
          message: `product already ${req.body.status}`,
        });
      }
    }
  );
};

let findSeller = (req, res, next) => {
  console.log("I am at step 1");
  return next();
  let product = req.data.product;
  if (product.addedBy.type == "seller") {
    let condition = {
      _id: product.addedBy.id,
    };
    crudModel.findOne(condition, seller, (err, seller) => {
      if (err) {
        console.log(MESSAGE.activeDeactive.errorFieldseller + err);
      } else {
        req.data.seller = seller;
        next();
      }
    });
  } else {
    return res.status(400).json({ message: MESSAGE.activeDeactive.unexpected });
  }
};

let sendEmail = (req, res, next) => {
  console.log("I am at step 2");
  return next();

  let seller = req.data.seller;
  if (utility.isEmail(seller.email)) {
    let product = req.data.product;
    let payload = {
      email: seller.email,
      subject: "MB Product Approval",
      template_id: config.sendgrid.productApprovedTemplateId,
      from: {
        fromEmail: config.cron.email.fromEmail,
        fromName: config.cron.email.fromName,
      },
      substitutions: {
        "{{productName}}": product.name,
      },
    };
    utility.sendEmail(payload, (err, sent) => {
      if (err) {
        console.log("error in  send email of activeDEactive product" + err);
        // return res.status(400).json({ error: true, message: 'error occured in sendEmail', err });
      } else {
        return -1;
      }
    });
  } else {
    return -1;
  }
};

let findProductIsAlreadyAddOrNot = (req, res, next) => {
  console.log("I am at step 3");
  let condition = [
    {
      $match: {
        $and: [
          {
            sellerId: new mongoose.Types.ObjectId("617d2982bd68c94d0bcb9200"),
          },
          {
            productId: new mongoose.Types.ObjectId(req.body.productId),
          },
        ],
      },
    },
  ];
  crudModel.aggregation(condition, sellerProductSchema, (err, product) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: MESSAGE.add.errorInFindProduct,
        error: err,
      });
    } else if (product && product.length > 0) {
      return res
        .status(200)
        .json({ success: true, message: "Product already exists" });
    } else {
      next();
    }
  });
};

let findProductDetails = (req, res, next) => {
  console.log("I am at step 4");
  let condition = {
    _id: req.body.productId,
  };
  crudModel.findOne(condition,productSchema,(err, response) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: MESSAGE.add.errorInFindProduct,
        error: err,
      });
    } else if (response) {
      req.data = {};
      req.data.product = response;
      next();
    } else {
      next();
    }
  });
};

let saveSellerProduct = (req, res, next) => {
  console.log("I am at step 5");
  let productData = {
    sellerId: new mongoose.Types.ObjectId("617d2982bd68c94d0bcb9200"),
    productId: new mongoose.Types.ObjectId(req.data.product._id),
    categoryId: new mongoose.Types.ObjectId(req.data.product.categoryId),
    price: req.data.product.price ? req.data.product.price : null,
    sellPrice: req.data.product.sellPrice ? req.data.product.sellPrice : null,
    minSellPrice: req.data.product.minSellPrice
      ? req.data.product.minSellPrice
      : null,
    purchasePrice: req.data.product.purchasePrice
      ? req.data.product.purchasePrice
      : null,
    membershipPrice: req.data.product.membershipPrice
      ? req.data.product.membershipPrice
      : null,
    storeMinQuantity: 5,
    perUserOrderQuantity: 5,
    created: new Date().getTime(),
    updated: new Date().getTime(),
    date: new Date(),
    isOrder: true,
    isActive: true,
    isApproved: true,
    approvedBy: req.decoded.id,
  };

  crudModel.create(productData, sellerProductSchema, (err, response) => {
    if (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: MESSAGE.add.errorInCreateProductData,
        error: err,
      });
    } else {
      panelTrack.create({
        userId: req.decoded.id,
        userType:"admin",
        message: `Seller product created by ${req.decoded.role}`,
        type: "sellerProductCreate",
        productId: req.data.product._id,
        sellerProductId: response._id,
        data: {
          sellerId: "617d2982bd68c94d0bcb9200",
          price: productData.price,
          sellPrice: productData.sellPrice,
          minSellPrice: productData.minSellPrice,
          purchasePrice: productData.purchasePrice,
          isApproved: true,
        },
      });
      res.status(200).json({
        success: true,
        message: MESSAGE.add.addSuccessfully,
      });
      next();
    }
  });
};

let updateSellerBrand = (req, res, next) => {
  console.log("I am at step 6");
  let condition = {
    sellerId: req.decoded.id,
    brandId: req.data.product.brand.id,
    subBrandId: req.data.product.subBrand.id,
  };
  let update = {
    $set: {
      sellerId: req.decoded.id,
      brandId: req.data.product.brand.id,
      subBrandId: req.data.product.subBrand.id,
      retailMargin: null,
      custMargin: null,
    },
  };
  sellerBrandSchema.updateOne(
    condition,
    update,
    { upsert: true },
    (err, response) => {
      if (err) {
        return res.status(400).json({
          error: true,
          success: false,
          message: "error in updating seller brand",
          error: err,
        });
      } else {
        next();
      }
    }
  );
};

let findSellerAndProduct = (req, res, next) => {
  console.log("I am at step 7");
  let condition = [
    {
      $match: {
        sellerId: new mongoose.Types.ObjectId(req.decoded.id),
        productId: new mongoose.Types.ObjectId(req.body.productId),
        categoryId: new mongoose.Types.ObjectId(req.body.categoryId),
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
  ];
  crudModel.aggregation(
    condition,
    sellerProductSchema,
    (err, sellerAndProduct) => {
      if (err) {
        console.log("ERROR:" + err);
      } else if (sellerAndProduct && sellerAndProduct.length > 0) {
        req.data = {};
        req.data.sellerAndProduct = sellerAndProduct[0];
        next();
      } else {
        return 1;
      }
    }
  );
};

let updateSellerCityinProduct = (req, res) => {
  console.log("I am at step 8");
  let sellerAndProduct = req.data.sellerAndProduct;
  crudModel.updateOne(
    { _id: sellerAndProduct.product._id },
    {
      $addToSet: {
        cityIds: sellerAndProduct.seller.cities,
      },
    },
    {},
    productSchema,
    (err, updated) => {
      if (err) {
        console.log("ERROR:" + err);
        return 0;
      } else {
        return 1;
      }
    }
  );
};

module.exports = [
  validate(validation.activeDeactive),
  activeDeactive,
  findSeller,
  sendEmail,
  validate(validation.add),
  findProductIsAlreadyAddOrNot,
  findProductDetails,
  saveSellerProduct,
  updateSellerBrand,
  findSellerAndProduct,
  updateSellerCityinProduct,
];
