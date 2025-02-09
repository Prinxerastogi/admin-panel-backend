"use strict";
let attributeSchema = require("../../sharedmb/schema/attribute"),
    crud = require("../../sharedmb/models/crud"),
    validation = require("./validation"),
    validate = require("express-validation"),
    MESSAGE = require("./message");

let checkAttribueData = (req, res) => {
    crud.findOne(
        { name: req.body.name, code: req.body.code },
        attributeSchema,
        (err, find) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: MESSAGE.addattribute.error,
                    err,
                });
            } else if (find == null) {
                next();
            } else {
                return res.status(201).json({
                    success: false,
                    message: MESSAGE.addattribute.exist,
                });
            }
        }
    );
};

let addAttribute = (req, res, next) => {
    let data = {
        name: req.body.name,
        type: req.body.type,
        values: req.body.values,
        code: req.body.code,
        created: new Date().getTime(),
        updated: new Date().getTime(),
        date: new Date(),
        isRequired: true,
        isUnique: true,
        defaultValue: req.body.defaultValue,
    };
    crud.create(data, attributeSchema, (error, response) => {
        if (error)
            return res.status(400).json({
                success: false,
                error: error,
                message: MESSAGE.addattribute.mongoerror,
            });
        else if (response != null)
            return res.status(200).json({
                success: true,
                message: MESSAGE.addattribute.added,
                response,
            });
        else
            return res.status(201).json({
                message: MESSAGE.addattribute.unknown,
                success: false,
            });
    });
};

module.exports = [validate(validation.add), addAttribute, checkAttribueData];
