var Joi = require("joi");

module.exports = {
    add: {
        body: {
            promocode: Joi.string().required(),
            offerUserType: Joi.string().required(),
            expireDate: Joi.date().required(),
            startDate: Joi.date().required(),
            useCount: Joi.number().required(),
        },
    },
    activeDeactive: {
        body: {
            offerId: Joi.string().required(),
            // status: Joi.string().required()
        },
    },
};
