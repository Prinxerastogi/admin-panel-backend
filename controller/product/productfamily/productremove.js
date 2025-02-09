"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
    productFamilySchema = require("../../../sharedmb/schema/productFaimly"),
    validate = require("express-validation"),
    validation = require("./validation"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let removeproductid = (req, res) => {
    let productIds = req.body.productIds;
    if (req.body.productIds.length > 0) {
        var objectIds = productIds.map((_) => {
            return mongoose.Types.ObjectId(_);
        });
    }

    crudModel.update(
        { _id: req.body.familyId },
        { $pull: { productIds: { $in: objectIds } } },
        {},
        productFamilySchema,
        (err, response) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: MESSAGE.removeproduct.error,
                    err: err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: MESSAGE.removeproduct.removed,
                    response: response,
                });
            }
        }
    );
};

module.exports = [validate(validation.productremove), removeproductid];
