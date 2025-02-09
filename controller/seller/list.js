"use strict";
let vendorSchema = require("../../sharedmb/schema/seller"),
    vendorModel = require("../../sharedmb/models/crud"),
    MESSAGE = require("./message");

module.exports = (req, res) => {
    let conditions = {};
    let projections = {};
    let options = {};
    vendorModel.findProjectionOptionAndSort(
        conditions,
        projections,
        options,
        vendorSchema,
        (error, response) => {
            if (error)
                return res.status(400).json({
                    message: MESSAGE.list.error,
                    error: error,
                    success: false,
                });
            else if (response.length != 0)
                return res.status(200).json({ success: true, data: response });
            else
                return res
                    .status(201)
                    .json({ message: MESSAGE.list.notfound, success: false });
        }
    );
};
