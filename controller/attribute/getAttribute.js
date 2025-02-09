"use strict";
let attributeSchema = require("../../sharedmb/schema/attribute"),
    crud = require("../../sharedmb/models/crud"),
    validation = require("./validation"),
    validate = require("express-validation"),
    MESSAGE = require("./message");

let getAttribute = (req, res, next) => {
    let conditions = {
        _id: req.query.id,
    };
    crud.findOne(conditions, attributeSchema, (error, response) => {
        if (error)
            return res.status(400).json({
                message: MESSAGE.getattribute.mongoerror,
                error: error,
            });
        else if (response != null)
            return res.status(200).json({ success: true, response });
        else
            return res.status(201).json({
                success: false,
                message: MESSAGE.getattribute.notfound,
            });
    });
};

module.exports = [validate(validation.get), getAttribute];
