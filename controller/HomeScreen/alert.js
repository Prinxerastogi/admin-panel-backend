// controllers/homeScreenCardController.js

const HomeScreenCard = require("../../sharedmb/schema/HomeScreenCard"); // adjust path if needed

async function getAnomalousHomeScreenCards(req, res) {
    try {
        const anomalies = await HomeScreenCard.aggregate([
            {
                $match: { isDeleted: false },
            },
            {
                $unwind: "$image",
            },
            {
                $match: {
                    "image.type": "product",
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$image.productId" },
                            regex: "^[0-9]+$",
                        },
                    },
                },
            },
            {
                $addFields: {
                    imageProductIdNumber: { $toInt: "$image.productId" },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "imageProductIdNumber",
                    foreignField: "id",
                    as: "productData",
                },
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "sellerproducts",
                    localField: "productData._id",
                    foreignField: "productId",
                    as: "sellerProductData",
                },
            },
            {
                $unwind: {
                    path: "$sellerProductData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    anomaly: {
                        $or: [
                            {
                                $ne: [
                                    "$image.price",
                                    "$sellerProductData.minSellPrice",
                                ],
                            },
                            { $eq: ["$sellerProductData.quantity", 0] },
                        ],
                    },
                },
            },
            {
                $match: {
                    anomaly: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    "sellerProductData.minSellPrice": 1,
                    "sellerProductData.quantity": 1,
                    "productData._id": 1,
                    "productData.id": 1,
                },
            },
        ]);

        res.json({ anomalies });
    } catch (error) {
        console.error("Error fetching anomalies:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = getAnomalousHomeScreenCards;
