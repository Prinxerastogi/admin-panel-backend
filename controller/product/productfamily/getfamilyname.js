"use strict";
let crud = require("../../../sharedmb/models/crud"),
    productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
    mongoose = require("mongoose"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let getfamilyname = (req, res) => {
    crud.findOneProjectionOptionAndSort(
        { _id: req.query.familyId },
        { name: 1 },
        {},
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.getfname.error,
                    error: err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: MESSAGE.getfname.found,
                    response: response,
                });
            }
        }
    );
};
module.exports = [validate(validation.getfamilyname), getfamilyname];
