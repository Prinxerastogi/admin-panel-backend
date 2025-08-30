"use strict";
const crud = require("../../sharedmb/models/crud");
const productSchema = require("../../sharedmb/schema/product");
const categorySchema = require("../../sharedmb/schema/category");
const config = require("config");
const mongoose = require("mongoose");
const validate = require("express-validation");
const validation = require("./validation");
const utility = require("../../sharedmb/utility/utility");
const moveImagefromTempToServer = require("../image/moveImageFromTempFolder");
const createImageVariantController = require("../image/imageVariant");
const panelTrack = require("../../sharedmb/schema/panelTack");
const util = require("util");

// Promisify callback-based functions to use them with async/await
const moveImagePromise = util.promisify(moveImagefromTempToServer);
const createImageVariantPromise = util.promisify(createImageVariantController);

const productSKUlastDigits = (index) => {
    const indexStr = index.toString();
    switch (indexStr.length) {
        case 1:
            return "000" + indexStr;
        case 2:
            return "00" + indexStr;
        case 3:
            return "0" + indexStr;
        default:
            return indexStr;
    }
};

const checkHsnCode = async (req, res, next) => {
    if (!req.body.hsnCode) {
        return res.status(400).json({
            success: false,
            message: "HSN code is mandatory",
        });
    }

    const hsnCode = req.body.hsnCode.toString();
    if (!/^10\d{6}$/.test(hsnCode)) {
        return res.status(400).json({
            success: false,
            message: "HSN code must be 8 digits starting with '10'",
        });
    }

    try {
        const product = await productSchema.findOne({ hsnCode: hsnCode });
        if (product) {
            return res.status(400).json({
                success: false,
                message: "HSN code already exists for another product.",
                existingProduct: {
                    _id: product._id,
                    name: product.name,
                    sku: product.sku,
                },
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error checking HSN code.",
            error: err.message,
        });
    }
};

const findProductSku = async (req, res, next) => {
    const condition = [
        { $match: { _id: new mongoose.Types.ObjectId(req.body.leafCatId) } },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "categoryId",
                as: "products",
            },
        },
        {
            $unwind: {
                path: "$products",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    try {
        const newSku = await categorySchema.aggregate(condition);
        if (newSku.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Category not found or has no products to determine SKU.",
            });
        }
        req.data = {};
        req.data.productSku = req.body.barCode;
        req.data.code = newSku[0]?.code || "";
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error finding product SKU.",
            error: err.message,
        });
    }
};

const findBarcodeAndSKU = async (req, res, next) => {
    const sku = req.data.code + productSKUlastDigits(req.data.productSku);
    const condition = { $or: [{ sku }] };

    if (req.body.barCode) {
        condition.$or.push({ barCode: req.body.barCode });
    }

    try {
        const response = await productSchema.find(condition);
        if (response.length > 0) {
            return res.status(409).json({
                success: false,
                message: "SKU or Barcode already exists.",
                products: response,
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error matching SKU and barcode.",
            error: err.message,
        });
    }
};

const createProduct = async (req, res, next) => {
    const product = req.body;
    const insertPayload = {
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
        sku: req.data.code + productSKUlastDigits(req.data.productSku),
        brand: {
            name: product.brand?.name || null,
            id: product.brand?._id
                ? new mongoose.Types.ObjectId(product.brand._id)
                : null,
        },
        subBrand: {
            name: product.subBrand?.name || null,
            id: product.subBrand?._id
                ? new mongoose.Types.ObjectId(product.subBrand._id)
                : null,
        },
        shipping: product.shipping || null,
        seo: product.seo || null,
        addedBy: {
            id: new mongoose.Types.ObjectId(req.decoded.id),
            type: "admin",
        },
        categoryId: new mongoose.Types.ObjectId(product.leafCatId),
        categories: [new mongoose.Types.ObjectId(product.leafCatId)],
        images: [],
        hsnCode: product.hsnCode.toString(),
        created: Date.now(),
        updated: Date.now(),
        date: new Date(),
        isSubscription: !!product.isSubscription,
        isOrder: !!product.isOrder,
        isMorningBuy: !!product.isMorningBuy,
        membershipPrice: product.membershipPrice,
        gst: product.gst,
        gstDesc: product.gstDesc || null,
        recommendedAttribute: product.recommendedAttribute || null,
        barCode:
            product.barCode ||
            req.data.code + productSKUlastDigits(req.data.productSku),
        isLastBuy: !!product.isLastBuying,
        purchasePrice: product.purchasePrice,
        minSellPrice: product.minSellPrice,
        parentId: product.parentId
            ? new mongoose.Types.ObjectId(product.parentId)
            : null,
        isParent: !!product.isParent,
    };

    try {
        const created = await productSchema.create(insertPayload);
        req.data.product = created;
        panelTrack.create({
            userId: req.decoded.id,
            userType: "admin",
            message: `New product created by ${req.decoded.role}`,
            type: "productCreate",
            productId: created._id,
            data: {
                name: created.name,
                sku: created.sku,
                price: created.price,
                sellPrice: created.sellPrice,
            },
        });
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error occurred during product creation.",
            error: err.message,
        });
    }
};

const copyImageFromTempToServer = async (req, res, next) => {
    const { product } = req.data;
    const folderName = product.id;
    const dstPath = `${config.upload.productImagePath}${folderName}/`;
    req.data.dstPath = dstPath;

    try {
        await moveImagePromise(req.body.images, dstPath);
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to move images.",
            error: err.message,
        });
    }
};

const createImageVariant = async (req, res, next) => {
    const imagePromises = req.body.images.map((image) =>
        createImageVariantPromise(req.data.dstPath, image)
    );
    try {
        await Promise.all(imagePromises);
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error creating image variants.",
            error: err.message,
        });
    }
};

const updateImages = async (req, res, next) => {
    const updatePayload = {
        $push: { images: { $each: req.body.images } },
    };
    try {
        await productSchema.updateOne(
            { _id: req.data.product._id },
            updatePayload
        );
        panelTrack.create({
            userId: req.decoded.id,
            userType: "admin",
            message: `Product images added by ${req.decoded.role}`,
            type: "productImageUpdate",
            productId: req.data.product._id,
            data: {
                imagesCount: req.body.images.length,
                images: req.body.images,
            },
        });
        if (req.body.isParent) {
            return res.status(200).json({
                success: true,
                message: "Parent product added successfully.",
                response: req.data.product._id,
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to update product with new images.",
            error: err.message,
        });
    }
};

const findParentProduct = async (req, res, next) => {
    if (!req.body.parentId) return next();
    try {
        const parentProduct = await productSchema.findById(req.body.parentId);
        if (!parentProduct) {
            return res.status(404).json({
                success: false,
                message: "Unable to find parent product.",
            });
        }
        req.data.parentProduct = parentProduct;
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error finding parent product.",
            error: err.message,
        });
    }
};

const updateParentProduct = async (req, res) => {
    // This function only runs if it's a child product, so parentId should exist.
    if (!req.body.parentId) {
        return res.status(200).json({
            success: true,
            message: "Product added successfully (no parent to update).",
            response: req.data.product._id,
        });
    }

    const { parentProduct, product } = req.data;

    // Check if parent already has the new child product listed
    const childExists = parentProduct.childProducts.some((child) =>
        child.productId.equals(product._id)
    );
    if (childExists) {
        // If child already exists, no update needed to parent, just finalize.
        return res.status(200).json({
            success: true,
            message: "Product added successfully.",
            response: product._id,
        });
    }

    // Structure for the new child product entry
    const newChildEntry = {
        productId: product._id,
        sellPrice: req.body.price,
        recommendedAttribute: req.body.recommendedAttribute || null,
    };

    // If the parent has no children yet, add itself first, then the new child
    if (parentProduct.childProducts.length === 0) {
        parentProduct.childProducts.push({
            productId: parentProduct._id,
            sellPrice: parentProduct.sellPrice,
            recommendedAttribute: parentProduct.recommendedAttribute || null,
        });
    }

    parentProduct.childProducts.push(newChildEntry);

    try {
        await parentProduct.save();
        panelTrack.create({
            userId: req.decoded.id,
            userType: "admin",
            message: `Child product added to parent by ${req.decoded.role}`,
            type: "productRelationUpdate",
            productId: product._id,
            data: {
                childProductId: product._id,
                parentProductId: req.body.parentId,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Product added successfully and parent updated.",
            response: product._id,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error updating parent product with new child.",
            error: err.message,
        });
    }
};

module.exports = [
    validate(validation.addProduct),
    checkHsnCode,
    findProductSku,
    findBarcodeAndSKU,
    createProduct,
    copyImageFromTempToServer,
    createImageVariant,
    updateImages,
    findParentProduct,
    updateParentProduct, // Simplified the parent/child logic
];
