"use strict";
let crud = require("../../../sharedmb/models/crud"),
    productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let getfamily = (req, res) => {
    crud.findProjectionOptionAndSort(
        {},
        {},
        { sort: { date: -1 } },
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.getfamily.error,
                    error: err,
                });
            } else {
                return res.status(200).json({
                    succes: true,
                    message: MESSAGE.getfamily.found,
                    response: response,
                });
            }
        }
    );
};
module.exports = [getfamily];
