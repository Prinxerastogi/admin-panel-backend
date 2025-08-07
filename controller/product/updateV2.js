let productSchema = require("../../sharedmb/schema/product");
let sellerSchema = require("../../sharedmb/schema/sellerProduct");
let mongoose = require("mongoose");
let validate = require("express-validation");
let validation = require("./validation");
let utility = require("../../sharedmb/utility/utility");
let categorySchema = require("../../sharedmb/schema/category");

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
let validateHsnCode = (req, res, next) => {
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
    productSchema.findOne(
        {
            hsnCode: hsnCode,
            _id: { $ne: mongoose.Types.ObjectId(productId) },
            isActive: true,
        },
        (err, existingProduct) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Error checking HSN code",
                    error: err,
                });
            }

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
        }
    );
};
let findBarcodeAndUpdate = (req, res, next) => {
    req.data = {};
    let condition = {
        barCode: req.body.product.barCode,
    };
    productSchema.findOne(condition, (err, response) => {
        if (err)
            return res.status(400).json({
                success: false,
                message: "error occured in matching barcode",
                err: err,
            });
        else if (response) {
            console.log("barcode already exist", response);
            req.data.barCodeMessage = "barcode already exist. ";
            next();
        } else {
            let condition = {
                _id: req.body.productId,
            };
            let update = {
                $set: {
                    barCode: req.body.product.barCode,
                },
            };
            productSchema.updateOne(condition, update, (err, response) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "barcode udpate failed",
                        err: err,
                    });
                } else if (response.nModified == 1) {
                    console.log("barcode updated", response);
                    req.data.barCodeMessage = "barcode updated. ";
                    next();
                } else {
                    return res.status(200).json({
                        success: false,
                        message: "barcode update failed",
                    });
                }
            });
        }
    });
};

let checkLeafCategory = (req, res, next) => {
    let condition = {
        _id: req.body.productId,
        categoryId: req.body.product.leafCatId,
    };
    productSchema.findOne(condition, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "error in find product",
                error: err,
                success: false,
            });
        } else {
            req.data.isCategoryChanged = response ? false : true;
            //req.data.isCategoryChanged = false;
            next();
        }
    });
};

// let findProductSku = (req, res, next) => {
//     if (req.data.isCategoryChanged) {
//         let condition = [
//             {
//                 '$match': {
//                     '_id': mongoose.Types.ObjectId(req.body.product.leafCatId)
//                 }
//             }, {
//                 '$lookup': {
//                     'from': 'products',
//                     'localField': '_id',
//                     'foreignField': 'categoryId',
//                     'as': 'products'
//                 }
//             }, {
//                 '$unwind': {
//                     'path': '$products',
//                     'includeArrayIndex': '0',
//                     'preserveNullAndEmptyArrays': true
//                 }
//             }, {
//                 '$addFields': {
//                     'intSku': {
//                         '$toInt': '$products.sku'
//                     }
//                 }
//             }, {
//                 '$group': {
//                     '_id': '$_id',
//                     'maxSku': {
//                         '$max': '$intSku'
//                     },
//                     'code': {
//                         '$first': '$code'
//                     }
//                 }
//             }, {
//                 '$addFields': {
//                     'newProductSku': {
//                         '$toString': {
//                             '$cond': [
//                                 '$maxSku', {
//                                     '$add': [
//                                         '$maxSku', 1
//                                     ]
//                                 }, {
//                                     '$concat': [
//                                         '$code', '0001'
//                                     ]
//                                 }
//                             ]
//                         }
//                     }
//                 }
//             }, {
//                 '$addFields': {
//                     'newProductSku': {
//                         '$toInt': {
//                             '$substr': [
//                                 '$newProductSku', 6, 4
//                             ]
//                         }
//                     }
//                 }
//             },
//         ]
//         categorySchema.aggregate(condition, (err, newSku) => {
//             if (err) {
//                 return res.status(400).json({ error: true, success: false, message: 'error in find findProductSku', err });
//             }
//             else if (newSku.length == 0) {
//                 return res.status(201).json({ success: false, message: 'sku not found in this category' });
//             }
//             else {
//                 req.data.productSku = newSku[0].newProductSku;
//                 req.data.code = newSku[0].code;
//                 next();
//             }
//         })
//     } else {
//         next();
//     }
// };

// let findSKUAndUpdate = (req, res, next) => {
//     if (req.data.isCategoryChanged) {
//         let condition = {
//             sku: req.data.code + productSKUlastDigits(req.data.productSku)
//         }
//         productSchema.findOne(condition, (err, response) => {
//             if (err) return res.status(400).json({ success: false, message: 'error occured in matching sku', err: err });
//             else if (response) {
//                 console.log("sku already exist", response)
//                 req.data.skuMessage = "sku already exist.";
//                 next();
//             } else {
//                 let condition = {
//                     _id: req.body.productId
//                 }
//                 let update = {
//                     $set: {
//                         sku: req.data.code + productSKUlastDigits(req.data.productSku)
//                     }
//                 }
//                 productSchema.updateOne(condition, update, (err, response) => {
//                     if (err) {
//                         return res.status(400).json({ success: false, message: 'sku udpate failed', err: err });
//                     } else if (response.nModified == 1) {
//                         console.log("sku updated", response)
//                         req.data.skuMessage = "sku updated."
//                         next();
//                     } else {
//                         return res.status(200).json({ success: false, message: 'sku update failed' });
//                     }
//                 })
//             }
//         })
//     } else {
//         next();
//     }
// }

let updateCategoryIdInSellerProduct = (req, res, next) => {
    if (req.data.isCategoryChanged) {
        let condition = {
            productId: req.body.productId,
        };
        let update = {
            categoryId: req.body.product.leafCatId,
        };
        sellerSchema.updateOne(condition, update, (err, response) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "category update failed for seller products",
                    err: err,
                });
            } else {
                next();
            }
        });
    } else {
        next();
    }
};

let updateProduct = (req, res) => {
    let product = req.body.product;
    let updateProductDetails = {
        name: product.name.toLowerCase(),
        _name: utility.removeSpecialCharAndDash(product.name.toLowerCase()),
        description: product.description ? product.description : null,
        lDescription: product.description
            ? utility.removeSpecialChar(product.description)
            : null,
        shortDesc: product.shortDesc ? product.shortDesc : null,
        lShortDesc: product.shortDesc
            ? utility.removeSpecialChar(product.shortDesc)
            : null,
        urlKey: product.urlKey,
        sellPrice: product.price,
        price: product.mrp,
        brand: {
            name: product.brand.name ? product.brand.name : null,
            id: product.brand._id
                ? mongoose.Types.ObjectId(product.brand._id)
                : null,
        },
        subBrand: {
            name: product.subBrand.name ? product.subBrand.name : null,
            id: product.subBrand._id
                ? mongoose.Types.ObjectId(product.subBrand._id)
                : null,
        },
        shipping: product.shipping ? product.shipping : null,
        seo: product.seo ? product.seo : null,
        categoryId: mongoose.Types.ObjectId(product.leafCatId),
        categories: mongoose.Types.ObjectId(product.leafCatId),
        tags: product.tags,
        hsnCode: product.hsnCode.toString(),
        updated: new Date().getTime(),
        isSubscription: product.isSubscription ? true : false,
        isOrder: product.isOrder ? true : false,
        isMorningBuy: product.isMorningBuy ? true : false,
        membershipPrice: product.membershipPrice,
        gst: product.gst,
        gstDesc: product.gstDesc ? product.gstDesc : null,
        recommendedAttribute: product.recommendedAttribute
            ? product.recommendedAttribute
            : null,
        isLastBuy: product.isLastBuying ? true : false,
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
    productSchema.findOneAndUpdate(condition, update, (err, updated) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error accured in hold product",
                success: false,
                error: err,
            });
        } else if (updated) {
            res.status(200).json({
                success: true,
                message:
                    "updated successfully." +
                    req.data.barCodeMessage +
                    (req.data.skuMessage ? req.data.skuMessage : ""),
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "already updated" });
        }
    });
};

module.exports = [
    validate(validation.updateProduct),
    validateHsnCode,
    findBarcodeAndUpdate,
    checkLeafCategory,
    // findProductSku,
    // findSKUAndUpdate,
    updateCategoryIdInSellerProduct,
    updateProduct,
];
