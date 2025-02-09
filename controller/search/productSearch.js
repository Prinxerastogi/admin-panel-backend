"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    categorySchama = require("../../sharedmb/schema/category"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let searchProductByValue = (req, res) => {
    let condition = [
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "categories",
                as: "products",
            },
        },
        {
            $unwind: {
                path: "$products",
            },
        },
        {
            $match: {
                $or: [
                    {
                        name: {
                            $regex: ".*" + req.query.value + ".*",
                        },
                    },
                    {
                        "products.name": {
                            $regex: ".*" + req.query.value + ".*",
                        },
                    },
                ],
            },
        },
        {
            $replaceRoot: {
                newRoot: "$products",
            },
        },
    ];
    crudModel.aggregation(condition, categorySchama, (err, product) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.productsearch.error,
                error: err,
            });
        } else if (product && product.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${product.length} product found`,
                product: product,
            });
        } else {
            return res.status(201).json({
                success: false,
                message: MESSAGE.productsearch.notfound,
            });
        }
    });
};

module.exports = [validate(validation.value), searchProductByValue];
