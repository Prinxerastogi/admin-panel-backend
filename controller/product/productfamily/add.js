"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
    productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let checkfamily = (req, res, next) => {
    crudModel.find(
        { name: req.body.name },
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res
                    .status(400)
                    .json({ error: true, success: false, err: error });
            } else if (response.length > 0) {
                return res
                    .status(201)
                    .json({ success: false, message: MESSAGE.add.exists });
            } else {
                next();
            }
        }
    );
};

let addfamily = (req, res) => {
    crudModel.create(
        {
            name: req.body.name,
            date: new Date(),
            updated: new Date().getTime(),
            created: new Date().getTime(),
        },
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.add.errorCreating,
                    error: err,
                });
            } else {
                return res.status(200).json({
                    succes: true,
                    message: MESSAGE.add.familyadded,
                    response: response,
                });
            }
        }
    );
};

module.exports = [validate(validation.add), checkfamily, addfamily];
