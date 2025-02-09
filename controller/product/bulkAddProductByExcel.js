let productSchema = require("../../sharedmb/schema/product"),
    mongoose = require("mongoose"),
    utility = require("../../sharedmb/utility/utility");

let findProductId = async (req, res, next) => {
    try {
        req.data = {};
        let condition = [
            {
                $sort: {
                    id: -1,
                },
            },
            {
                $limit: 1,
            },
        ];
        console.log("Test");
        let products = await productSchema.aggregate(condition);
        req.data.nextIndex = products.length > 0 ? products[0].id : 1;
        next();
    } catch (err) {
        res.status(400).json({ err: true, message: err.message });
    }
};

let addProduct = async (req, res) => {
    try {
        let bulkUpdate = req.body.products.map((data) => {
            if (data._id) {
                return {
                    updateOne: {
                        filter: {
                            _id: data._id,
                        },
                        update: {
                            $set: {
                                barCode: data.barCode,
                                description: data.description,
                                lDescription: utility.removeSpecialChar(
                                    data.description
                                ),
                                gst: data.gst,
                                hsnCode:
                                    data.hsnCode && data.hsnCode.toString(),
                                isLastBuy: data.isLastBuy,
                                isMorningBuy: data.isMorningBuy,
                                isOrder: data.isOrder,
                                isSubscription: data.isSubscription,
                                membershipPrice: data.membershipPrice,
                                brand: {
                                    name: data.brandName,
                                    id: data.brandid,
                                },
                                subBrand: {
                                    name: data.subBrandName,
                                    id: data.subBrandid,
                                },
                                companyName: data.companyName,
                                seo: {
                                    metaDescription: data.metaDescription,
                                    metaKeywords: data.metaKeywords,
                                    metaTitle: data.metaTitle,
                                },
                                minSellPrice: data.minSellPrice,
                                name: data.name,
                                _name: utility.removeSpecialCharAndDash(
                                    data.name
                                ),
                                price: data.price,
                                purchasePrice: data.purchasePrice,
                                recommendedAttribute: data.recommendedAttribute,
                                sellPrice: data.sellPrice,
                                sku: data.sku,
                                urlKey: utility.removeSpecialCharAndDash(
                                    data.urlKey
                                ),
                                // categoryId: mongoose.Types.ObjectId('61e69487b009a850f34c4e0d'),
                                // categories: mongoose.Types.ObjectId('61e69487b009a850f34c4e0d'),
                            },
                        },
                    },
                };
            } else {
                req.data.nextIndex = req.data.nextIndex + 1;
                return {
                    insertOne: {
                        document: {
                            barCode: data.barCode,
                            description: data.description,
                            lDescription: utility.removeSpecialChar(
                                data.description
                            ),
                            gst: data.gst,
                            hsnCode: data.hsnCode && data.hsnCode.toString(),
                            isLastBuy: data.isLastBuy,
                            isMorningBuy: data.isMorningBuy,
                            isOrder: data.isOrder,
                            isSubscription: data.isSubscription,
                            membershipPrice: data.membershipPrice,
                            id: req.data.nextIndex,
                            seo: {
                                metaDescription: data.metaDescription,
                                metaKeywords: data.metaKeywords,
                                metaTitle: data.metaTitle,
                            },
                            brand: {
                                name: data.brandName,
                                id: data.brandid,
                            },
                            subBrand: {
                                name: data.subBrandName,
                                id: data.subBrandid,
                            },
                            companyName: data.companyName,
                            minSellPrice: data.minSellPrice,
                            name: data.name,
                            _name: utility.removeSpecialCharAndDash(data.name),
                            price: data.price,
                            purchasePrice: data.purchasePrice,
                            recommendedAttribute: data.recommendedAttribute,
                            sellPrice: data.sellPrice,
                            sku: data.sku,
                            urlKey: utility.removeSpecialCharAndDash(
                                data.urlKey
                            ),
                            // images: data.images,
                            // images_demo: data.images_demo,
                            // categoryId: mongoose.Types.ObjectId(data.categoryId),
                            // categories: mongoose.Types.ObjectId(data.categoryId),
                            categoryId: mongoose.Types.ObjectId(
                                "61e69487b009a850f34c4e0d"
                            ),
                            categories: mongoose.Types.ObjectId(
                                "61e69487b009a850f34c4e0d"
                            ),
                            "verification.isImageVerify": true,
                            "verification.isproductDetailVerify": true,
                            "verification.isApproved": true,
                            approvedBy: req.decoded.id,
                            status: "approved",
                            updated: new Date().getTime(),
                            isActive: true,
                            isHold: false,
                            isNew: false,
                        },
                    },
                };
            }
        });

        let response = await productSchema.bulkWrite(bulkUpdate);
        if (response.nModified > 0 || response.nInserted > 0) {
            res.status(200).json({
                success: true,
                message: "products inserted successfully",
            });
        } else {
            res.status(200).json({
                success: false,
                message: "products already inserted",
                bulkUpdate: bulkUpdate,
                response: response,
            });
        }
    } catch (err) {
        res.status(400).json({ err: true, message: err.message });
    }
};

module.exports = [findProductId, addProduct];
