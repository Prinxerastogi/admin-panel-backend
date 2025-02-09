"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let products = (req, res) => {
    let condition = [
        {
            $match: {
                $and: [
                    {
                        categories: {
                            $in: [
                                mongoose.Types.ObjectId(req.query.categoryId),
                            ],
                        },
                    },
                    {
                        isDeleted: false,
                    },
                    {
                        "verification.isImageVerify": true,
                        "verification.isproductDetailVerify": true,
                        "verification.isApproved": true,
                    },
                ],
            },
        },
    ];
    crudModel.aggregation(condition, productSchema, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: MESSAGE.productListbyCategory.error,
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
                message: MESSAGE.productListbyCategory.noProductFound,
            });
        }
    });
};

module.exports = [validate(validation.categoryId), products];
