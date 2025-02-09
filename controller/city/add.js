"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    citySchema = require("../../sharedmb/schema/city"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let checkCity = (req, res, next) => {
    let condition = { name: req.body.city };
    crudModel.findOne(condition, citySchema, (err, city) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (city) {
            return res
                .status(201)
                .json({ success: false, message: MESSAGE.add.saved });
        } else {
            next();
        }
    });
};

let saveCityData = (req, res, next) => {
    let data = {
        name: req.body.city,
        state: req.body.state,
        date: new Date(),
    };
    crudModel.create(data, citySchema, (err, cityData) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: true,
                message: MESSAGE.savecity.error,
                error: err,
            });
        } else {
            return res
                .status(200)
                .json({ success: true, message: MESSAGE.savecity.saved });
        }
    });
};

module.exports = [validate(validation.add), checkCity, saveCityData];
