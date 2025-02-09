let joi = require("joi");

module.exports = {
    cityId: {
        body: {
            cityId: joi.string().required(),
            areaName: joi.string().required(),
        },
    },
};
