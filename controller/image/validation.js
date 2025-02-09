var Joi = require("joi");

module.exports = {
    removeImage: {
        body: {
            productId: Joi.string().required(),
            imageName: Joi.string().required(),
        },
    },
    updateProductImage: {
        body: {
            productId: Joi.string().required(),
            images: Joi.array().required(),
        },
    },
};
