var Joi = require("joi");

module.exports = {
    productId: {
        body: {
            productId: Joi.string().required(),
        },
    },
    categoryId: {
        query: {
            categoryId: Joi.string().required(),
        },
    },
    addProduct: {
        body: {
            brand: {
                _id: Joi.string().required(),
                name: Joi.string().required(),
            },
            // description: Joi.string().required(),
            gst: Joi.number().required(),
            hsnCode: Joi.string().required(),
            isLastBuying: Joi.boolean().required(),
            isMorningBuy: Joi.boolean().required(),
            isOrder: Joi.boolean().required(),
            isSubscription: Joi.boolean().required(),
            leafCatId: Joi.string().required(),
            // membershipPrice: Joi.number().required(),
            name: Joi.string().required(),
            // price: Joi.number().required(),
            // mrp: Joi.number().required(),
            // purchasePrice: Joi.number().required(),
            // minSellPrice: Joi.number().required(),
            recommendedAttribute: Joi.string().required(),
            subBrand: {
                _id: Joi.string().required(),
                name: Joi.string().required(),
            },
            urlKey: Joi.string().required(),
            images: Joi.array().required(),
            seo: Joi.object().required(),
            shipping: Joi.object().required(),
        },
    },
    updateProduct: {
        body: {
            productId: Joi.string().required(),
            product: Joi.object().required(),
        },
    },
    activeDeactive: {
        body: {
            productId: Joi.string().required(),
            // status: Joi.string().required()
        },
    },
    view: {
        query: {
            productId: Joi.string().required(),
        },
    },
 add: {
        body: {
            // sellerId: Joi.string().required(),
            productId: Joi.string().required(),
        },
    },
};
