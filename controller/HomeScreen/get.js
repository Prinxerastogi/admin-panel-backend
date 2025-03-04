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
        console.log("cards", cards.length);
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
                $or: [
                    { type: "horizontalbanner" },
                    { type: "verticalbanner" },
                    { type: "featurewwall" },
                ],
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
        console.log("cards", cards.length);

        if (cards) {
            req.data.cards = [...req.data.cards, ...cards];
        }
        next();
    });
};

const getGifCards = async (req, res, next) => {
    let pipeline = [
        {
            $match: {
                isDeleted: false,
                type: {
                    $in: [
                        "gif",
                        "searchpagebanners",
                        "categorypagebanners",
                        "featurewall",
                    ],
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

const getProductCards = async (req, res) => {
    let pipeline = [
        {
            $match: { isDeleted: false, type: "product" },
        },
    ];
    console.log("req.data.cards", req.data.cards.length);

    crudModel.aggregation(pipeline, HomeScreenCard, async (err, cards) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  findHomeScreenCards",
                err,
            });

        console.log("cardsproduct", cards.length);

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
    getGifCards,
    getProductCards,
    // findSellerCatIds,
    // findAllCategoryProducts
];
