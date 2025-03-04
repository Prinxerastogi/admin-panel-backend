"use strict";
let crud = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    mongoose = require("mongoose");

const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const findCondition = mongoose.isValidObjectId(productId)
            ? { _id: productId }
            : { id: productId };
        const product = await productSchema.findOne(findCondition);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

module.exports = getProduct;
