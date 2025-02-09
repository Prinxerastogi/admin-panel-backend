"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    societySchema = require("../../sharedmb/schema/society"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

module.exports = [
    validate(validation.get),
    (req, res) => {
        let condition = {
            cityId: req.query.cityId,
        };
        let projection = {
            name: 1,
            townShip: 1,
            noOfBlocks: 1,
            lat: 1,
            lng: 1,
            location: 1,
        };
        let options = {};

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
                        message: MESSAGE.get.error,
                        error: error,
                    });
                else if (response.length > 0)
                    return res.status(200).json({
                        message: MESSAGE.get.found,
                        success: true,
                        response: response,
                    });
                else
                    return res.status(201).json({
                        success: false,
                        message: MESSAGE.get.notfound,
                    });
            }
        );
    },
];
