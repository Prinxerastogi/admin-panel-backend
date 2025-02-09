let crudModel = require("../../../sharedmb/models/crud");
let productFamilySchema = require("../../../sharedmb/schema/productFaimly");
let validate = require("express-validation");
let validation = require("./validation");
let mongoose = require("mongoose");

let updatefamilyname = (req, res) => {
    crudModel.update(
        { _id: req.body.familyId },
        { $set: { name: req.body.name } },
        {},
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "error occured in updatefamilyname",
                    err: err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "updated successfully",
                    response: response,
                });
            }
        }
    );
};
module.exports = [validate(validation.updatefamilyname), updatefamilyname];
