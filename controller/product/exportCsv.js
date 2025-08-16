const mongoose = require("mongoose");
const SellerProduct = require("../../sharedmb/schema/sellerProduct");
const Product = require("../../sharedmb/schema/product");
const { Parser } = require("json2csv");

module.exports = [
    async (req, res) => {
        try {
            const data = await SellerProduct.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productInfo",
                    },
                },
                {
                    $unwind: "$productInfo",
                },
                {
                    $project: {
                        sellerProductId: "$_id",
                        price: 1,
                        sellPrice: 1,
                        quantity: 1,
                        perUserOrderQuantity: 1,
                        minSellPrice: 1,
                        storeMinQuantity: 1,
                        name: "$productInfo.name",
                        leafCategory: "$productInfo.categoryId",
                        hsnCode: "$productInfo.hsnCode",
                        recommendedAttribute:
                            "$productInfo.recommendedAttribute",
                        description: "$productInfo.description",
                        image: {
                            $arrayElemAt: ["$productInfo.images", 0],
                        },
                        sku: "$productInfo.sku",
                        barCode: "$productInfo.barCode",
                        hsnCode: "$productInfo.hsnCode",
                        metaKeyword: "$productInfo.seo.metaKeywords",
                        metaTitle: "$productInfo.seo.metaTitle",
                        metaDescription: "$productInfo.seo.metaDescription",
                    },
                },
                {
                    $graphLookup: {
                        from: "categories",
                        startWith: "$leafCategory",
                        connectFromField: "parentId",
                        connectToField: "_id",
                        as: "categoryHierarchy",
                        depthField: "level",
                    },
                },
                {
                    $addFields: {
                        leafCategoryId: "$leafCategory",
                        leafCategoryName: {
                            $getField: {
                                field: "name",
                                input: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$categoryHierarchy",
                                                cond: {
                                                    $eq: [
                                                        "$$this._id",
                                                        "$leafCategory",
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                        subCategory: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$categoryHierarchy",
                                        cond: { $eq: ["$$this.level", 1] },
                                    },
                                },
                                0,
                            ],
                        },
                        rootCategory: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$categoryHierarchy",
                                        cond: { $eq: ["$$this.level", 2] },
                                    },
                                },
                                0,
                            ],
                        },
                    },
                },
                {
                    $addFields: {
                        subCategoryId: "$subCategory._id",
                        subCategoryName: "$subCategory.name",
                        rootCategoryId: "$rootCategory._id",
                        rootCatName: "$rootCategory.name",
                    },
                },
                {
                    $project: {
                        categoryHierarchy: 0,
                        subCategory: 0,
                        rootCategory: 0,
                    },
                },
            ]);

            if (data.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No data found for the provided seller ID",
                });
            }

            // Define the fields for the CSV in the desired order
            const fields = [
                "name",
                "price",
                "minSellPrice",
                "perUserOrderQuantity",
                "quantity",
                "sellPrice",
                "storeMinQuantity",
                "sellerProductId",
                "sku",
                "barCode",
                "hsnCode",
                "recommendedAttribute",
                "description",
                "image",
                "metaTitle",
                "metaKeyword",
                "metaDescription",
                "rootCategoryId",
                "rootCatName",
                "subCategoryId",
                "subCategoryName",
                "leafCategoryId",
                "leafCategoryName",
            ];

            // Initialize the JSON to CSV parser
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);

            // Set the response header to force download
            res.header("Content-Type", "text/csv");
            res.attachment("seller_product_data.csv");
            res.send(csv);
        } catch (err) {
            console.error("Error fetching data:", err);
            res.status(500).send("Internal Server Error");
        }
    },
];
