const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");
const productSchema = require("../../sharedmb/schema/product");
const mongoose = require("mongoose");
const validate = require("express-validation");
const validation = require("./validation");

const createProductGroup = async (req, res) => {
    // const product = await productSchema.findOne({ id: req.body.products[0] });
    const data = {
        // name: product.name,
        products: req.body.products,
        created: new Date().getTime(),
        updated: new Date().getTime(),
    };
    crudModel.create(data, productGroupSchema, async (err, response) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Error creating product group",
                error: err.message,
            });
        }

        // Update all products with the new group ID
        try {
            return res.status(201).json({
                success: true,
                message:
                    "Product group created successfully and products updated",
                data: response,
            });
        } catch (updateErr) {
            return res.status(400).json({
                success: false,
                message: "Error updating products with group ID",
                error: updateErr.message,
            });
        }
    });
};

module.exports = [validate(validation.create), createProductGroup];
