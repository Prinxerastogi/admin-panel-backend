"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    tagsSchema = require("../../sharedmb/schema/tags"),
    productSchema = require("../../sharedmb/schema//product"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let findTag = (req, res, next) => {
    let conditions = {
        _id: req.params.tag_id,
    };
    crudModel.findOne(conditions, tagsSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in activDeactive offer",
                error: err,
            });
        } else if (response) {
            crudModel.find({ tags: response._id }, productSchema, (err, product) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: "error occured in activDeactive offer",
                        error: err,
                    });
                } else {
                    const products = product.map((item) => {
                        return {
                            name: item.name,
                            barCode: item.barCode,
                            id: item.id,
                        };
                    });
                    return res.status(200).json({
                        success: true,
                        message: "found",
                        products,
                        data: response,
                    });
                }
            });
        } else {
            return res
                .status(201)
                .json({ success: true, message: "not found" });
        }
    });
};
module.exports = [findTag];
