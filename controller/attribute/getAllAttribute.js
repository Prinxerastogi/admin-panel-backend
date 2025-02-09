"use strict";
let attributeSchema = require("../../sharedmb/schema/attribute"),
    crud = require("../../sharedmb/models/crud"),
    MESSAGE = require("./message");
let getAllAttribute = (req, res, next) => {
    let conditions = {};

    crud.find(conditions, attributeSchema, (error, response) => {
        if (error)
            return res.status(400).json({
                message: MESSAGE.allattribute.mongoerror,
                error: error,
            });
        else if (response.length > 0)
            return res.status(200).json({
                success: true,
                response: response,
                message: MESSAGE.allattribute.found,
            });
        else
            return res.status(201).json({
                success: false,
                message: MESSAGE.allattribute.notfound,
            });
    });
};

module.exports = [getAllAttribute];
