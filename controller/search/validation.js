var Joi = require("joi");

module.exports = {
    value: {
        query: {
            value: Joi.string().required(),
        },
    },
};
