"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    categorySchama = require("../../sharedmb/schema/category"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let searchCategoryByValue = (req, res) => {
    let condition = [
        {
            $match: {
                name: {
                    $regex: ".*" + req.query.value + ".*",
                },
            },
        },
    ];
    crudModel.aggregation(condition, categorySchama, (err, category) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.categorysearch.error,
                error: err,
            });
        } else if (category && category.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${category.length} category found`,
                category: category,
            });
        } else {
            return res.status(201).json({
                success: false,
                message: MESSAGE.categorysearch.notfound,
            });
        }
    });
};

module.exports = [validate(validation.value), searchCategoryByValue];
