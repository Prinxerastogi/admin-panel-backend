"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    societySchema = require("../../sharedmb/schema/society"),
    validate = require("express-validation"),
    validation = require("./validation"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

module.exports = [
    validate(validation.getBlockList),
    (req, res) => {
        let condition = {
            _id: req.query.societyId,
        };
        let projection = {
            block: 1,
            flat: 1,
        };
        let options = { sort: { name: 1 } };

        crudModel.findProjectionOptionAndSort(
            condition,
            projection,
            options,
            societySchema,
            (error, response) => {
                if (error)
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: MESSAGE.blocklist.error,
                        error: error,
                    });
                else if (response.length > 0)
                    return res.status(200).json({
                        message: MESSAGE.blocklist.found,
                        success: true,
                        response: response,
                    });
                else
                    return res.status(201).json({
                        success: false,
                        message: MESSAGE.blocklist.notfound,
                    });
            }
        );
    },
];
