"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    societySchema = require("../../sharedmb/schema/society"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let findSociety = (req, res, next) => {
    let conditions = {
        name: req.body.society,
        cityId: req.body.cityId,
    };

    crudModel.findOne(conditions, societySchema, (err, society) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (society != null) {
            return res.status(201).json({
                success: false,
                message: `${society.name} already added in this city`,
            });
        } else if (society == null) {
            next();
        } else {
            return res
                .status(500)
                .json({ success: true, message: MESSAGE.add.unknown });
        }
    });
};
let addSociety = (req, res) => {
    let society = {
        name: req.body.society,
        _name: utility.removeSpecialCharAndDash(req.body.society),
        cityId: req.body.cityId,
        townShip: req.body.townShip,
        noOfBlocks: req.body.noOfBlocks,
        location: {
            lat: req.body.lat,
            lng: req.body.lng,
        },
        lat: req.body.lat,
        lng: req.body.lng,
        date: new Date(),
    };

    crudModel.create(society, societySchema, (error, societyData) => {
        if (error) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.savedataError,
                error: error,
            });
        } else {
            return res
                .status(200)
                .json({ success: true, message: MESSAGE.add.added });
        }
    });
};
module.exports = [validate(validation.add), findSociety, addSociety];
