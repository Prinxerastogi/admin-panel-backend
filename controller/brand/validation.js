var Joi = require("joi");

module.exports = {
    addBrand: {
        body: {
            name: Joi.string().required(),
        },
    },
    update: {
        body: {
            brandId: Joi.string().required(),
        },
    },
    view: {
        query: {
            brandId: Joi.string().required(),
        },
    },
};
