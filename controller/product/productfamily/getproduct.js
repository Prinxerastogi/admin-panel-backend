"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
    productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
    validate = require("express-validation"),
    validation = require("./validation"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");
let getproductid = (req, res) => {
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
                message: MESSAGE.getproduct.error,
                error: err,
            });
        } else {
            return res.status(200).json({
                succes: true,
                message: MESSAGE.getproduct.found,
                response: response,
            });
        }
    });
};
module.exports = [validate(validation.getproduct), getproductid];
