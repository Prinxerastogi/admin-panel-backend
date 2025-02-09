"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
    productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let getproduct = (req, res, next) => {
    let condition = [
        { $match: { _id: mongoose.Types.ObjectId(req.query.familyId) } },
        {
            $lookup: {
                from: "products",
                localField: "productIds",
                foreignField: "_id",
                as: "product",
            },
        },
    ];

    crudModel.aggregation(condition, productFamilySchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "error occured in getting products",
                error: err,
            });
        } else if (response[0].product.length <= 0) {
            next();
        } else {
            return res.status(200).json({
                succes: true,
                message: " Products found, can't be removed",
            });
        }
    });
};

let removefamily = (req, res) => {
    crudModel.update(
        { _id: mongoose.Types.ObjectId(req.query.familyId) },
        { $set: { isDeleted: true } },
        {},
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "error occured in removefamily",
                    err: err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "removed successfully",
                    response: response,
                });
            }
        }
    );
};
module.exports = [validate(validation.delete), getproduct, removefamily];
