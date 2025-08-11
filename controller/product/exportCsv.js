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
                        hsnCode: "$productInfo.hsnCode",
                        recommendedAttribute:
                            "$productInfo.recommendedAttribute",
                        description: "$productInfo.description",
                        image: { $arrayElemAt: ["$productInfo.images", 0] },
                        sku: "$productInfo.sku",
                        barCode: "$productInfo.barCode",
                        hsnCode: "$productInfo.hsnCode",
                        metaKeyword: "$productInfo.seo.metaKeyword",
                        metaTitle: "$productInfo.seo.metaTitle",
                        metaDescription: "$productInfo.seo.metaDescription",
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
