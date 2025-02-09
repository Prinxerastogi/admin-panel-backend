"use strict";
let categorySchema = require("../../sharedmb/schema/category"),
    crud = require("../../sharedmb/models/crud"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

(module.exports = validate(validation.bindAttribute)),
    (req, res) => {
        let conditions = {
            _id: req.body.categoryId,
            attributes: {
                $nin: [req.body.attributeId],
            },
        };
        let update = {
            $push: {
                attributes: req.body.attributeId,
            },
        };
        let options = {};

        crud.updateOne(
            conditions,
            update,
            options,
            categorySchema,
            (error, response) => {
                if (error)
                    res.status(400).json({
                        error: error,
                        message: MESSAGE.bindattribute.error,
                        success: false,
                    });
                else if (response.nModified == 1)
                    res.status(200).json({
                        success: true,
                        response: response,
                        message: MESSAGE.bindattribute.addattribute,
                    });
                else
                    res.status(201).json({
                        success: false,
                        message: MESSAGE.bindattribute.update,
                    });
            }
        );
    };
