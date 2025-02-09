"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    validate = require("express-validation"),
    validation = require("./validation"),
    MESSAGE = require("./message");

let findProduct = (req, res, next) => {
    crudModel.findOne(
        { _id: req.body.productId },
        productSchema,
        (err, product) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: MESSAGE.approved.error,
                    error: err,
                });
            } else {
                req.data = {};
                req.data.product = product;
                next();
            }
        }
    );
};

let update = (req, res) => {
    let product = req.data.product;
    let update = {};
    let condition = {
        _id: req.body.productId,
    };
    if (req.body.type == "image") {
        update = {
            $set: {
                "verification.isImageVerify": true,
                updated: new Date().getTime(),
            },
        };
    } else if (req.body.type === "productData") {
        update = {
            $set: {
                "verification.isproductDetailVerify": true,
                updated: new Date().getTime(),
            },
        };
    } else if (
        product.verification.isImageVerify &&
        product.verification.isproductDetailVerify
    ) {
        update = {
            $set: {
                "verification.isApproved": true,
                approvedBy: req.decoded.id,
                status: "approved",
                updated: new Date().getTime(),
                isHold: false,
                isActive: true,
            },
        };
    } else {
        return res
            .status(400)
            .json({ success: false, message: MESSAGE.approved.verify });
    }

    let option = {};
    crudModel.updateOne(
        condition,
        update,
        option,
        productSchema,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.approved.Approvalerror,
                    error: err,
                });
            } else if (updated.nModified > 0 && updated.n > 0) {
                return res.status(200).json({
                    success: true,
                    message: ` ${req.body.type} has been approved`,
                });
            } else if (updated.nModified == 0) {
                return res.status(201).json({
                    success: false,
                    message: MESSAGE.approved.alreadyApproved,
                });
            } else {
                return res.status(202).json({
                    success: false,
                    message: MESSAGE.approved.unknownError,
                });
            }
        }
    );
};

module.exports = [validate(validation.productId), findProduct, update];
