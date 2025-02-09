var Joi = require("joi");

module.exports = {
    citySeller: {
        query: {
            cityId: Joi.string().required(),
        },
    },
    sellerId: {
        body: {
            sellerId: Joi.string().required(),
        },
    },
    profile: {
        query: {
            sellerId: Joi.string().required(),
        },
    },
    assign: {
        body: {
            sellerId: Joi.string().required(),
        },
    },
};
