var Joi = require("joi");

module.exports = {
    getproduct: {
        query: {
            familyId: Joi.string().required(),
        },
    },
    getfamilyname: {
        query: {
            famiyId: Joi.string().required(),
        },
    },
    productremove: {
        body: {
            familyId: Joi.string().required(),
        },
    },
    update: {
        body: {
            familyId: Joi.string().required(),
        },
    },
    updatefamilyname: {
        body: {
            familyId: Joi.string().required(),
        },
    },
    add: {
        body: {
            name: Joi.string().required(),
        },
    },
    delete: {
        query: {
            familyId: Joi.string().required(),
        },
    },
};
