var Joi = require("joi");

module.exports = {
    add: {
        society: Joi.string().required(),
        cityId: Joi.string().required(),
    },
    addBlock: {
        societyId: Joi.string().required(),
        blockName: Joi.string().required(),
    },
    addFlat: {
        body: {
            societyId: Joi.string().required(),
        },
    },
    get: {
        query: {
            cityId: Joi.string().required(),
        },
    },
    getBlockList: {
        query: {
            societyId: Joi.string().required(),
        },
    },
    getFlatList: {
        query: {
            societyId: Joi.string().required(),
        },
    },
};
