const Joi = require("joi");

module.exports = {
    create: {
        body: {
            products: Joi.array().items(Joi.string()).required(),
        },
    },
    update: {
        params: {
            id: Joi.number().required(),
        },
        body: {
            name: Joi.string().required(),
            products: Joi.array().items(Joi.string()).required(),
        },
    },
    delete: {
        params: {
            id: Joi.number().required(),
        },
    },
    getById: {
        params: {
            id: Joi.number().required(),
        },
    },
};
