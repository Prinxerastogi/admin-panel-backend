"use strict";
let crudModel = require("../../../sharedmb/models/crud"),
    sellerProductSchema = require("../../../sharedmb/schema/sellerProduct"),
    validate = require("express-validation"),
    validation = require("./validation"),
    config = require("config"),
    utility = require("../../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");
//send email when the product appved.

let findSeller = (req, res, next) => {
    let condition = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.body.sellerProductId),
            },
        },
        {
            $lookup: {
                from: "sellers",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller",
            },
        },
        {
            $unwind: {
                path: "$seller",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: {
                path: "$product",
            },
        },
    ];
    crudModel.aggregation(
        condition,
        sellerProductSchema,
        (err, sellerproduct) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: MESSAGE.approved.errorFindseller,
                    err,
                });
            } else if (sellerproduct && sellerproduct.length > 0) {
                req.data = {};
                req.data.sellerproduct = sellerproduct[0];
                next();
            }
        }
    );
};

let approvalSellerAddedProduct = (req, res, next) => {
    let condition = {
        _id: req.body.sellerProductId,
        isDeleted: false,
    };
    let update = {
        $set: {
            isApproved: true,
            approvedBy: req.decoded.id,
        },
    };
    let option = {};
    crudModel.updateOne(
        condition,
        update,
        option,
        sellerProductSchema,
        (err, updatedData) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: true,
                    message: MESSAGE.approved.error,
                    error: err,
                });
            } else if (updatedData.nModified > 0 && updatedData.n > 0) {
                // next();

                return res.status(200).json({
                    success: true,
                    message: MESSAGE.approved.approvedsuccess,
                });
            } else {
                return res.status(201).json({
                    success: false,
                    message: MESSAGE.approved.already,
                });
            }
        }
    );
};

let sendEmailToseller = (req, res) => {
    let sellerProduct = req.data.sellerproduct;
    if (utility.isEmail(sellerProduct.seller.email)) {
        let payload = {
            email: sellerProduct.seller.email,
            subject: "MB Product Approval",
            template_id: config.sendgrid.ExistingProductApprovedTemplateId,
            from: {
                fromEmail: config.cron.email.fromEmail,
                fromName: config.cron.email.fromName,
            },
            substitutions: {
                "{{productName}}": sellerProduct.product.name,
            },
        };
        utility.sendEmail(payload, (err, sent) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: MESSAGE.approved.errorSendmail,
                    err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: MESSAGE.approved.approvedsuccess,
                });
            }
        });
    } else {
        return res.status(200).json({
            success: true,
            message: MESSAGE.approved.approvedBUtmailNotsent,
        });
    }
};

module.exports = [
    validate(validation.approved),
    findSeller,
    approvalSellerAddedProduct,
    sendEmailToseller,
];
