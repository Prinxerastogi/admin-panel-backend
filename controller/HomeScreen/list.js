const HomeScreenCard = require("../../sharedmb/schema/HomeScreenCard");
const crudModel = require("../../sharedmb/models/crud");

const getCategoryCards = async (req, res, next) => {
    req.data = {};
    req.data.cards = [];
    let pipeline = [
        { $match: { isDeleted: false, type: "category" } },
        { $sort: { position: 1 } },
        { $unwind: { path: "$categories" } },
        {
            $lookup: {
                from: "categories",
                localField: "categories.categoryId",
                foreignField: "_id",
                as: "category.categoryInfo",
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "categories.categoryId",
                foreignField: "parentId",
                as: "category.subCategories",
            },
        },
        {
            $project: {
                type: 1,
                title: 1,
                categories: 1,
                position: 1,
                created: 1,
                updated: 1,
                date: 1,
                deviceType: 1,
                category: {
                    name: { $arrayElemAt: ["$category.categoryInfo.name", 0] },
                    images: {
                        $arrayElemAt: ["$category.categoryInfo.images", 0],
                    },
                    categoryId: {
                        $arrayElemAt: ["$category.categoryInfo._id", 0],
                    },
                    id: { $arrayElemAt: ["$category.categoryInfo.id", 0] },
                    subCategories: {
                        name: 1,
                        images: 1,
                        _id: 1,
                    },
                },
            },
        },
        {
            $group: {
                _id: "$_id",
                type: { $first: "$type" },
                title: { $first: "$title" },
                position: { $first: "$position" },
                created: { $first: "$created" },
                updated: { $first: "$updated" },
                categories: { $push: "$category" },
                deviceType: { $first: "$deviceType" },
            },
        },
    ];

    crudModel.aggregation(pipeline, HomeScreenCard, async (err, cards) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  findHomeScreenCards",
                err,
            });
        if (cards) {
            req.data.cards = cards;
        }
        next();
    });
};

const getBannerCards = async (req, res, next) => {
    let pipeline = [
        {
            $match: { isDeleted: false },
        },
        {
            $match: {
                $or: [{ type: "horizontalbanner" }, { type: "verticalbanner" }],
            },
        },
    ];

    crudModel.aggregation(pipeline, HomeScreenCard, async (err, cards) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  findHomeScreenCards",
                err,
            });
        if (cards) {
            req.data.cards = [...req.data.cards, ...cards];
        }
        next();
    });
};

const getPopularProductCards = async (req, res, next) => {
    let pipeline = [
        {
            $match: {
                isDeleted: false,
                type: "popularproducts",
            },
        },
        {
            $unwind: { path: "$popularproducts" },
        },
        {
            $lookup: {
                from: "products",
                localField: "popularproducts.productId",
                foreignField: "_id",
                as: "productInfo",
            },
        },
        {
            $group: {
                _id: "$productId",
                type: { $first: "$type" },
                title: { $first: "$title" },
                position: { $first: "$position" },
                created: { $first: "$created" },
                updated: { $first: "$updated" },
                date: { $first: "$date" },
                productInfo: { $push: "$productInfo" },
                popularproducts: { $push: "$popularproducts" },
                deviceType: { $first: "$deviceType" },
            },
        },
        {
            $project: {
                type: 1,
                title: 1,
                position: 1,
                created: 1,
                updated: 1,
                date: 1,
                deviceType: 1,
                popularproducts: {
                    $map: {
                        input: "$productInfo",
                        as: "popProd",
                        in: {
                            productId: "$$popProd.productId",
                            displayName: "$$popProd.displayName",
                            name: { $arrayElemAt: ["$productInfo.name", 0] },
                            images: {
                                $arrayElemAt: ["$productInfo.images", 0],
                            },
                            price: { $arrayElemAt: ["$productInfo.price", 0] },
                            discount: {
                                $arrayElemAt: ["$productInfo.discount", 0],
                            },
                            discountType: {
                                $arrayElemAt: ["$productInfo.discountType", 0],
                            },
                            id: { $arrayElemAt: ["$productInfo._id", 0] },
                        },
                    },
                },
            },
        },
    ];

    crudModel.aggregation(pipeline, HomeScreenCard, async (err, cards) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  findHomeScreenCards",
                err,
            });
        else if (cards) {
            req.data.cards = [...req.data.cards, ...cards];
        }
        next();
    });
};
const getSvgCards = async (req, res, next) => {
    let pipeline = [
        {
            $match: {
                isDeleted: false,
                type: { $in: ["gif", "searchpagebanners"] },
            },
        },
    ];

    crudModel.aggregation(pipeline, HomeScreenCard, async (err, cards) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  findHomeScreenCards",
                err,
            });
        else if (cards) {
            req.data.cards = [...req.data.cards, ...cards];
        }
        next();
    });
};

const getProductCards = async (req, res) => {
    let pipeline = [
        {
            $match: { isDeleted: false, type: "product" },
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryItems.categoryId",
                foreignField: "_id",
                as: "categoryInfo",
            },
        },
        {
            $project: {
                type: 1,
                title: 1,
                categories: 1,
                position: 1,
                created: 1,
                updated: 1,
                date: 1,
                deviceType: 1,
                categoryItems: {
                    categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
                    categoryId: 1,
                },
            },
        },
    ];

    crudModel.aggregation(pipeline, HomeScreenCard, async (err, cards) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  findHomeScreenCards",
                err,
            });

        if (cards) {
            req.data.cards = [...req.data.cards, ...cards];
            // next()
        } else {
        }
        let cardsArr = req.data.cards;
        cardsArr.sort((a, b) => a.position - b.position);
        return res
            .status(200)
            .json({ success: true, message: "cards found", cards: cardsArr });
    });
};

module.exports = [
    getCategoryCards,
    getBannerCards,
    getPopularProductCards,
    getSvgCards,
    getProductCards,
];
