var Joi = require("joi");

module.exports = {
    update: {
        body: {
            gstId: Joi.string().required(),
        },
    },
};
