var Joi = require("joi");

module.exports = {
    removeImage: {
        body: {
            image: Joi.string().required(),
        },
    },
    create: {
        body: {
            title: Joi.string().required(),
            images: Joi.array(),
            appPage: Joi.string(),
            webPage: Joi.string(),
        },
    },
};
