let request = require("needle");
const axios = require("axios");
var request1 = require("request");
var parser = require("http-string-parser");
const parseJson = require("parse-json");
let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/compareProduct");
let productSchema = require("../../sharedmb/schema/product");
let mongoose = require("mongoose");

let findGrofferproduct = (req, res, next) => {
  req.data = {};
  request1.get(
    `https://grofers.com/v6/merchant/${req.body.product.gmId}/product/${req.body.product.gpId}/`,
    function (error, response) {
      if (error) {
        return error;
      } else if (response.statusCode == 200 && response.statusMessage == "OK") {
        let grofferProductData = parseJson(response.body);

        if (
          Number(req.body.product.purchasePrice) <=
          Number(grofferProductData.data.product.price)
        ) {
          req.data.grofferProduct = grofferProductData.data.product;
          req.data.sellPrice = grofferProductData.data.product.price;
          next();
        } else {
          req.data.sellPrice = req.body.product.purchasePrice;
          next();
        }
      } else {
        return res.status(201).json({
          success: false,
          message: "groffer Data not found",
          GMerchantId: req.body.product.gmId,
          GproductId: req.body.product.gpId,
        });
      }
    }
  );
};

let updateProductPrice = (req, res) => {
  crud.updateOne(
    {
      gpId: Number(req.body.product.gpId),
      gmId: Number(req.body.product.gmId),
      _id: req.body.product._id,
    },
    {
      $set: {
        sellPrice: Number(req.data.sellPrice),
      },
    },
    {},
    productSchema,
    (err, updated) => {
      if (err) {
        return err;
      } else {
        return res.status(200).json({
          success: true,
          message: "price updated successfully",
          GMerchantId: req.body.product.gmId,
          GproductId: req.body.product.gpId,
          productId: new mongoose.Types.ObjectId(req.body.product._id),
        });
      }
    }
  );
};

let findGrofmilkBasketerproduct = (req, res) => {
  request.post(
    `https://www.milkbasket.com/products/get`,
    {
      city_id: req.body.product.milkbasketCityId,
      product_id: req.body.product.milkbasketProductId,
    },
    { json: true },
    function (error, response) {
      if (error) {
        return error;
      } else if (response.statusCode == 200 && response.statusMessage == "OK") {
        crud.updateOne(
          {
            milkbasketProductId: Number(req.body.product.milkbasketProductId),
            milkbasketCityId: Number(req.body.product.milkbasketCityId),
          },
          {
            $set: {
              milkBasketProduct: response.body.data,
            },
          },
          {},
          schema,
          (err, updated) => {
            if (err) {
              return err;
            } else {
              return res.status(200).json({
                success: true,
                message: "successfully run",
                GrofferProduct: req.data.grofferProductData,
                milkBasketProduct: response.body.data,
              });
            }
          }
        );
      }
    }
  );
};

module.exports = [
  findGrofferproduct,
  updateProductPrice,
  // findGrofmilkBasketerproduct
];
