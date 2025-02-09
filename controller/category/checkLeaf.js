"use strict";
let categorySchema = require("../../sharedmb/schema/category"),
    crudModel = require("../../sharedmb/models/crud"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let findSubCategory = (req, res, next) => {
    let condition = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.query.categoryId),
                isDeleted: false,
                isActive: true,
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "childIds",
                foreignField: "_id",
                as: "subCategory",
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "parentIds",
                foreignField: "_id",
                as: "parentCategoery",
            },
        },
    ];
    crudModel.aggregation(condition, categorySchema, (err, category) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.checklist.error,
                error: err,
            });
        } else if (category && category.length > 0) {
            return res.status(200).json({
                success: true,
                message: MESSAGE.checklist.found,
                category: category,
            });
        } else {
            return res
                .status(200)
                .json({ success: false, message: MESSAGE.checklist.noFound });
        }
    });
};

module.exports = [validate(validation.categoryAttributeList), findSubCategory];
