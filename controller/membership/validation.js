var Joi = require("joi");

module.exports = {
    activaDeactive: {
        body: {
            membershipId: Joi.string().required(),
            // status: Joi.string().required()
        },
    },
    update: {
        body: {
            membershipId: Joi.string().required(),
        },
    },
};
