var Joi = require("joi");

module.exports = {
    addRootCat: {
        body: {
            urlKey: Joi.string().required(),
            name: Joi.string().required(),
            images: Joi.array().required(),
            //attributes: Joi.array().required(),
        },
    },
    bindAttribute: {
        body: {
            categoryId: Joi.string().required(),
            attributeId: Joi.string().required(),
        },
    },
    categoryAttributeList: {
        query: {
            categoryId: Joi.string().required(),
        },
    },
    getAttributeOfCategory: {
        query: {
            id: Joi.string().required(),
        },
    },
    removeImage: {
        body: {
            categoryId: Joi.string().required(),
            imageName: Joi.string().required(),
        },
    },
};
