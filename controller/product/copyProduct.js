"use strict";
let crud = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    config = require("config"),
    mongoose = require("mongoose");

const copyProduct = async (req, res) => {
    try {
        const { currentProductId, copyFromProductId, fieldsToCopy } = req.body;

        if (
            !currentProductId ||
            !copyFromProductId ||
            !fieldsToCopy ||
            fieldsToCopy.length === 0
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Missing Fields" });
        }

        // Find the product from which we are copying
        const findCondition = mongoose.isValidObjectId(copyFromProductId)
            ? { _id: copyFromProductId }
            : { id: copyFromProductId };
        const copyFromProduct = await productSchema.findOne(findCondition);
        if (!copyFromProduct) {
            return res
                .status(404)
                .json({ success: false, message: "Source product not found" });
        }

        // Prepare the update object
        let updateData = {};
        fieldsToCopy.forEach((field) => {
            if (copyFromProduct[field] !== undefined) {
                updateData[field] = copyFromProduct[field];
            }
        });

        // Update the current product
        const updatedProduct = await productSchema.findByIdAndUpdate(
            currentProductId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedProduct) {
            return res
                .status(404)
                .json({ success: false, message: "Target product not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Product details copied successfully",
            updatedProduct,
        });
    } catch (error) {
        console.error("Error copying product details:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

module.exports = copyProduct;
