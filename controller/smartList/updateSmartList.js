"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    smartListSchema = require("../../sharedmb/schema/smartList"),
    productSchema = require("../../sharedmb/schema/product"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let findSmartList = (req, res, next) => {
    let conditions = {
        _id: req.body.smartlist_id,
    };
    crudModel.findOne(conditions, smartListSchema, (err, smartList) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (smartList != null) {
            next();
        } else {
            return res
                .status(404)
                .json({ success: false, message: `SmartList Not Found` });
        }
    });
};

let updateSmartList = (req, res) => {
    let condition = {
        _id: req.body.smartlist_id,
    };
    let update = {
        name: req.body.smartlist_name,
        _name: utility.removeSpecialCharAndDash(req.body.smartlist_name),
        urlkey: utility.removeSpecialCharAndDash(req.body.smartlist_name),
        isActive: req.body.isActive,
        updateDate: new Date(),
    };

    let config = {};
    if (req.body.category) config.category = req.body.category;
    if (req.body.subCategory) config.subCategory = req.body.subCategory;
    if (req.body.leafCategory) config.leafCategory = req.body.leafCategory;
    if (req.body.brand) config.brand = req.body.brand;
    if (req.body.subBrand) config.subBrand = req.body.subBrand;
    if (req.body.minPrice) config.minPrice = req.body.minPrice;
    if (req.body.maxPrice) config.maxPrice = req.body.maxPrice;
    if (req.body.minDiscount) config.minDiscount = req.body.minDiscount;
    if (req.body.maxDiscount) config.maxDiscount = req.body.maxDiscount;

    if (Object.keys(config).length > 0) {
        update.config = config;
    }

    let unsetFields = {};
    if (!req.body.category) unsetFields["config.category"] = "";
    if (!req.body.subCategory) unsetFields["config.subCategory"] = "";
    if (!req.body.leafCategory) unsetFields["config.leafCategory"] = "";
    if (!req.body.brand) unsetFields["config.brand"] = "";
    if (!req.body.subBrand) unsetFields["config.subBrand"] = "";
    if (!req.body.minPrice) unsetFields["config.minPrice"] = "";
    if (!req.body.maxPrice) unsetFields["config.maxPrice"] = "";
    if (!req.body.minDiscount) unsetFields["config.minDiscount"] = "";
    if (!req.body.maxDiscount) unsetFields["config.maxDiscount"] = "";

    smartListSchema.findOneAndUpdate(condition, update, (error, updated) => {
        if (error) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.savedataError,
                error: error,
            });
        } else {
            if (req.body.products) {
                productSchema.updateMany(
                    { smartList: [req.body.smartlist_id] },
                    { $set: { smartList: [] } },
                    (error, updated) => {
                        if (error) {
                            return res.status(400).json({
                                error: true,
                                success: false,
                                message: MESSAGE.add.savedataError,
                                error: error,
                            });
                        } else {
                            req.body.products.forEach((prodId, index) => {
                                productSchema.findOneAndUpdate(
                                    { id: Number(prodId) },
                                    { $set: { smartList: [req.body.smartlist_id] } },
                                    (error, updated) => {
                                        if (error) {
                                            return res.status(400).json({
                                                error: true,
                                                success: false,
                                                message: MESSAGE.add.savedataError,
                                                error: error,
                                            });
                                        }
                                    }
                                );
                            });
                            return res.status(200).json({
                                success: true,
                                message: `${MESSAGE.add.update}`,
                            });
                        }
                    }
                );
            } else {
                return res
                    .status(200)
                    .json({ success: true, message: MESSAGE.add.update });
            }
        }
    });
};

module.exports = [findSmartList, updateSmartList];
