var Joi = require("joi");

module.exports = {
    approved: {
        body: {
            sellerProductId: Joi.string().required(),
        },
    },
};
