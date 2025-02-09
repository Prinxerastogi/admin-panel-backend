"use strict";
let sellerSchema = require("../../sharedmb/schema/seller"),
    crudModel = require("../../sharedmb/models/crud"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let getSellerListByCity = (req, res) => {
    let condition = [
        {
            $match: {
                cities: mongoose.Types.ObjectId(req.query.cityId),
            },
        },
    ];
    crudModel.aggregation(condition, sellerSchema, (err, sellers) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.cityseller.error,
                error: err,
            });
        } else if (sellers && sellers.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${sellers.length} seller found`,
                sellers: sellers,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: MESSAGE.cityseller.notfound });
        }
    });
};

module.exports = [validate(validation.citySeller), getSellerListByCity];
