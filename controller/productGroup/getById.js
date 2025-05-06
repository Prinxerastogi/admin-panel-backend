const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");
const mongoose = require("mongoose");
const validate = require("express-validation");
const validation = require("./validation");

const getProductGroupById = (req, res) => {
    const condition = [
        {
            $match: {
                id: Number(req.params.id),
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "products",
                foreignField: "id",
                as: "productDetails",
            },
        },
    ];

    crudModel.aggregation(condition, productGroupSchema, (err, group) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Error retrieving product group",
                error: err.message,
            });
        }
        if (!group || group.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product group not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Product group retrieved successfully",
            data: group[0],
        });
    });
};

module.exports = [validate(validation.getById), getProductGroupById];
