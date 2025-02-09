var Joi = require("joi");

module.exports = {
    activeDeactve: {
        body: {
            cityId: Joi.string().required(),
            value: Joi.string().required(),
        },
    },
    add: {
        body: {
            city: Joi.string().required(),
            state: Joi.string().required(),
        },
    },
};
