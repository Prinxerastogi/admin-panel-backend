"use strict";
let crud = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    config = require("config"),
    mongoose = require("mongoose"),
    panelTrack = require("../../sharedmb/schema/panelTack");

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

        const currentProduct = await productSchema.findById(currentProductId);
        if (!currentProduct) {
            return res
                .status(404)
                .json({ success: false, message: "Target product not found" });
        }

        let updateData = {};
        let modifiedFields = {};

        fieldsToCopy.forEach((field) => {
            if (copyFromProduct[field] !== undefined) {
                const oldValue = currentProduct[field];
                const newValue = copyFromProduct[field];
                
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    updateData[field] = newValue;
                    modifiedFields[field] = {
                        // oldValue: oldValue,
                        newValue: newValue,
                        copiedFrom: copyFromProductId
                    };
                }
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({
                success: true,
                message: "No changes needed - values are already the same",
                currentProduct
            });
        }

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

        await panelTrack.create({
            adminId: req.decoded.id,
            message: `Product details copied from ${copyFromProduct.name} by ${req.decoded.role}`,
            type: "productCopy",
            productId: currentProductId,
            sourceProductId: copyFromProductId,
            data: {
                copiedFields: Object.keys(modifiedFields),
                fieldDetails: modifiedFields,
                sourceProduct: {
                    id: copyFromProductId,
                    name: copyFromProduct.name,
                    sku: copyFromProduct.sku
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Product details copied successfully",
            updatedProduct,
            copiedFields: Object.keys(modifiedFields)
        });
    } catch (error) {
        console.error("Error copying product details:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

module.exports = copyProduct;