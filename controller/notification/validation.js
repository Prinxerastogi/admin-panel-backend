var Joi = require("joi");
module.exports = {
    activeDeactive: {
        body: {
            notificationId: Joi.string().required(),
        },
    },
    add: {
        body: {
            images: Joi.array().required(),
        },
    },
};
