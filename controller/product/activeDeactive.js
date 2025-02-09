"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    validate = require("express-validation"),
    validation = require("./validation"),
    seller = require("../../sharedmb/schema/seller"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    MESSAGE = require("./message");

//sens email when the seller Aproved proved.

let activeDeactive = (req, res, next) => {
    let condition = {
        _id: req.body.productId,
    };
    let update = {
        $set: {
            isActive: req.body.status,
            updated: new Date().getTime(),
        },
    };
    let option = {};
    crudModel.findOneAndUpdate(
        condition,
        update,
        option,
        productSchema,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.activeDeactive.error,
                    error: err,
                });
            } else if (updated) {
                req.data = {};
                req.data.product = updated;
                if (updated.addedBy.type == "admin") {
                    return res.status(200).json({
                        success: true,
                        message: `product is in ${req.body.status}`,
                    });
                }
                res.status(200).json({
                    success: true,
                    message: `product is in ${req.body.status}`,
                });
                next();
            } else {
                return res.status(201).json({
                    success: false,
                    message: `product already ${req.body.status}`,
                });
            }
        }
    );
};

let findSeller = (req, res, next) => {
    let product = req.data.product;
    if (product.addedBy.type == "seller") {
        let condition = {
            _id: product.addedBy.id,
        };
        crudModel.findOne(condition, seller, (err, seller) => {
            if (err) {
                console.log(MESSAGE.activeDeactive.errorFieldseller + err);
            } else {
                req.data.seller = seller;
                next();
            }
        });
    } else {
        return res
            .status(400)
            .json({ message: MESSAGE.activeDeactive.unexpected });
    }
};

let sendEmail = (req, res) => {
    let seller = req.data.seller;
    if (utility.isEmail(seller.email)) {
        let product = req.data.product;
        let payload = {
            email: seller.email,
            subject: "MB Product Approval",
            template_id: config.sendgrid.productApprovedTemplateId,
            from: {
                fromEmail: config.cron.email.fromEmail,
                fromName: config.cron.email.fromName,
            },
            substitutions: {
                "{{productName}}": product.name,
            },
        };
        utility.sendEmail(payload, (err, sent) => {
            if (err) {
                console.log(
                    "error in  send email of activeDEactive product" + err
                );
                // return res.status(400).json({ error: true, message: 'error occured in sendEmail', err });
            } else {
                return -1;
            }
        });
    } else {
        return -1;
    }
};

module.exports = [
    validate(validation.activeDeactive),
    activeDeactive,
    findSeller,
    sendEmail,
];
