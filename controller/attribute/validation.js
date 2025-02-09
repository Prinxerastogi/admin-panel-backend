var Joi = require("joi");

module.exports = {
    add: {
        body: {
            name: Joi.string().required(),
            code: Joi.string().required(),
            values: Joi.array().required(),
        },
    },
    get: {
        query: {
            id: Joi.string().required(),
        },
    },
    update: {
        body: {
            id: Joi.string().required(),
        },
    },
};
