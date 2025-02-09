"use strict";
let sellerSchema = require("../../sharedmb/schema/seller"),
    crud = require("../../sharedmb/models/crud"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        let conditions = {
            isProfileVerify: true,
            isActivate: true,
            isVerify: true,
        };
        let projections = {
            phoneNo: 1,
            name: 1,
            businessType: 1,
            "taxInformation.gst": 1,
            "sellerInformation.fullAddress": 1,
            isVerify: 1,
            "sellerInformation.businessType": 1,
            "invoiceAddress.businessEntityName": 1,
            email: 1,
            area: 1,
        };
        crud.findProjectionOptionAndSort(
            conditions,
            projections,
            options,
            sellerSchema,
            (error, response) => {
                if (error)
                    return res.status(400).json({
                        message: MESSAGE.profile.error,
                        error: error,
                        success: false,
                    });
                else if (response != null)
                    return res
                        .status(200)
                        .json({ success: true, response: response });
                else
                    return res.status(201).json({
                        message: MESSAGE.profile.notfound,
                        success: false,
                    });
            }
        );
    },
];
