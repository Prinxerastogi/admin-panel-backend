"use strict";
let vendorSchema = require("../../sharedmb/schema/seller"),
    vendorModel = require("../../sharedmb/models/crud"),
    MESSAGE = require("./message");

module.exports = (req, res) => {
    let conditions = {
        _id: req.body._id,
    };
    let key = req.body.key;
    let update = {
        $set: req.body,
    };
    vendorModel.updateOne(
        conditions,
        update,
        { new: true, upsert: true },
        vendorSchema,
        (error, response) => {
            if (error)
                return res.status(400).json({
                    message: MESSAGE.editprofile.error,
                    error: error,
                    success: false,
                });
            else if (response.nModified == 1)
                return res.status(200).json({
                    message: MESSAGE.editprofile.updated,
                    success: true,
                });
            else
                return res.status(201).json({
                    message: MESSAGE.editprofile.unknownerror,
                    success: false,
                });
        }
    );
};
