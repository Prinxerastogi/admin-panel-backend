let productSchema = require("../../sharedmb/schema/product");
let sellerSchema = require("../../sharedmb/schema/sellerProduct");
let mongoose = require("mongoose");
let validate = require("express-validation");
let validation = require("./validation");
let utility = require("../../sharedmb/utility/utility");
let categorySchema = require("../../sharedmb/schema/category");
let panelTrack = require("../../sharedmb/schema/panelTack");

let productSKUlastDigits = (index) => {
    switch (index.toString().length) {
        case 1:
            return "000" + index;
        case 2:
            return "00" + index;
        case 3:
            return "0" + index;
        case 4:
        default:
            return index;
    }
};

let validateHsnCode = async (req, res, next) => {
    if (!req.body.product.hsnCode) {
        return res.json({
            success: false,
            message: "HSN code is mandatory",
        });
    }

    const hsnCode = req.body.product.hsnCode.toString();
    const productId = req.body.productId;
    if (!/^10\d{6}$/.test(hsnCode)) {
        return res.json({
            success: false,
            message: "HSN code must be 8 digits starting with '10'",
        });
    }
    try {
        const existingProduct = await productSchema.findOne({
            hsnCode: hsnCode,
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
            isActive: true,
        });

        if (existingProduct) {
            return res.json({
                success: false,
                message:
                    "HSN code already exists for >" + existingProduct?.name,
                existingProduct: {
                    id: existingProduct._id,
                    name: existingProduct.name,
                    sku: existingProduct.sku,
                },
            });
        }
        next();
    } catch (err) {
        return res.json({
            success: false,
            message: "Error checking HSN code",
            error: err,
        });
    }
};

let findBarcodeAndUpdate = async (req, res, next) => {
    req.data = {};
    let condition = {
        barCode: req.body.product.barCode,
    };
    try {
        const response = await productSchema.findOne(condition);
        if (response) {
            console.log("barcode already exist", response);
            req.data.barCodeMessage = "barcode already exist. ";
            next();
        } else {
            let updateCondition = {
                _id: req.body.productId,
            };
            let updatePayload = {
                $set: {
                    barCode: req.body.product.barCode,
                },
            };
            const updateResponse = await productSchema.updateOne(
                updateCondition,
                updatePayload
            );
            if (updateResponse.modifiedCount === 1) {
                console.log("barcode updated", updateResponse);
                req.data.barCodeMessage = "barcode updated. ";
                panelTrack.create({
                    userId: req.decoded.id,
                    userType: "admin",
                    message: `Product barcode updated by ${req.decoded.role}`,
                    type: "productUpdate",
                    productId: req.body.productId,
                    data: {
                        field: "barCode",
                        newValue: req.body.product.barCode,
                    },
                });
                next();
            } else {
                return res.status(200).json({
                    success: false,
                    message: "barcode update failed",
                });
            }
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Error occurred while matching or updating barcode",
            err: err,
        });
    }
};

let checkLeafCategory = async (req, res, next) => {
    let condition = {
        _id: req.body.productId,
        categoryId: req.body.product.leafCatId,
    };
    try {
        const response = await productSchema.findOne(condition);
        req.data.isCategoryChanged = response ? false : true;
        next();
    } catch (err) {
        return res.status(400).json({
            message: "Error in finding product",
            error: err,
            success: false,
        });
    }
};

let updateCategoryIdInSellerProduct = async (req, res, next) => {
    if (req.data.isCategoryChanged) {
        let condition = {
            productId: req.body.productId,
        };
        let update = {
            categoryId: req.body.product.leafCatId,
        };
        try {
            await sellerSchema.updateOne(condition, update);
            panelTrack.create({
                userId: req.decoded.id,
                userType: "admin",
                message: `Product category updated in seller products by ${req.decoded.role}`,
                type: "productCategoryUpdate",
                productId: req.body.productId,
                data: {
                    oldCategoryId: req.data.oldCategoryId,
                    newCategoryId: req.body.product.leafCatId,
                },
            });
            next();
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Category update failed for seller products",
                err: err,
            });
        }
    } else {
        next();
    }
};

let updateProduct = async (req, res) => {
    let product = req.body.product;

    try {
        const oldProduct = await productSchema.findOne({
            _id: req.body.productId,
        });
        if (!oldProduct) {
            return res
                .status(404)
                .json({ success: false, message: "Product not found." });
        }
        req.data.oldProduct = oldProduct;

        let updateProductDetails = {
            name: product.name.toLowerCase(),
            _name: utility.removeSpecialCharAndDash(product.name.toLowerCase()),
            description: product.description || null,
            lDescription: product.description
                ? utility.removeSpecialChar(product.description)
                : null,
            shortDesc: product.shortDesc || null,
            lShortDesc: product.shortDesc
                ? utility.removeSpecialChar(product.shortDesc)
                : null,
            urlKey: product.urlKey,
            sellPrice: product.price,
            price: product.mrp,
            brand: {
                name: product.brand.name || null,
                id: product.brand._id
                    ? new mongoose.Types.ObjectId(product.brand._id)
                    : null,
            },
            subBrand: {
                name: product.subBrand.name || null,
                id: product.subBrand._id
                    ? new mongoose.Types.ObjectId(product.subBrand._id)
                    : null,
            },
            shipping: product.shipping || null,
            seo: product.seo || null,
            categoryId: new mongoose.Types.ObjectId(product.leafCatId),
            categories: new mongoose.Types.ObjectId(product.leafCatId),
            tags: product.tags,
            hsnCode: product.hsnCode.toString(),
            updated: new Date().getTime(),
            isSubscription: !!product.isSubscription,
            isOrder: !!product.isOrder,
            isMorningBuy: !!product.isMorningBuy,
            membershipPrice: product.membershipPrice,
            gst: product.gst,
            gstDesc: product.gstDesc || null,
            recommendedAttribute: product.recommendedAttribute || null,
            isLastBuy: !!product.isLastBuying,
            purchasePrice: product.purchasePrice,
            minSellPrice: product.minSellPrice,
            barCode: product.barCode,
            altBarCodes: product.altBarCodes
                ? product.altBarCodes.map((code) => code.toLowerCase())
                : [],
        };

        let condition = {
            _id: req.body.productId,
        };
        let update = {
            $set: updateProductDetails,
        };
        if (product.images?.length > 0) {
            update.$set.images = product.images;
        }

        const updatedProduct = await productSchema.findOneAndUpdate(
            condition,
            update
        );

        if (updatedProduct) {
            const modifiedFields = {};
            if (req.data.oldProduct) {
                Object.keys(updateProductDetails).forEach((key) => {
                    if (
                        JSON.stringify(req.data.oldProduct[key]) !==
                        JSON.stringify(updateProductDetails[key])
                    ) {
                        modifiedFields[key] = {
                            newValue: updateProductDetails[key],
                        };
                    }
                });
            }

            panelTrack.create({
                userId: req.decoded.id,
                userType: "admin",
                message: `Product updated by ${req.decoded.role}`,
                type: "productUpdate",
                productId: req.body.productId,
                data: modifiedFields,
            });

            res.status(200).json({
                success: true,
                message:
                    "Updated successfully. " +
                    (req.data.barCodeMessage || "") +
                    (req.data.skuMessage || ""),
            });
        } else {
            return res.status(201).json({
                success: false,
                message: "Product not found or already updated",
            });
        }
    } catch (err) {
        console.error("Error updating product:", err);
        return res.status(400).json({
            error: true,
            message: "An error occurred while updating the product",
            success: false,
            error: err,
        });
    }
};

module.exports = [
    validate(validation.updateProduct),
    validateHsnCode,
    findBarcodeAndUpdate,
    checkLeafCategory,
    updateCategoryIdInSellerProduct,
    updateProduct,
];
