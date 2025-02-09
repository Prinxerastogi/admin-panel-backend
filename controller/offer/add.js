"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    offerSchema = require("../../sharedmb/schema/offer"),
    uid = require("uid");

let checkAffilateUser = (req, res, next) => {
    if (req.body.offerType == "offer") {
        next();
    } else {
        crudModel.findOne(
            {
                userId: req.body.refralUser,
                offerType: "affiliate",
            },
            offerSchema,
            (err, user) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "error occured in checkAffilateUser ",
                        err,
                    });
                } else if (!user || user == null) {
                    next();
                } else {
                    return res.status(201).json({
                        success: false,
                        message:
                            "this user already exists with this offer type",
                        err,
                    });
                }
            }
        );
    }
};

let offerType = (req, res, next) => {
    if (req.body.offerType == "affiliate") {
        let code = uid();
        req.body.promocode = code;
        req.body.name = code;
        req.body.userId = req.body.refralUser;
        req.body.refralAmount = {
            senderAmount: Number(req.body.refralSenderAmount),
            recieverAmount: Number(req.body.refralSenderAmount),
        };
        req.body.isActive = true;
        next();
    } else {
        next();
    }
};

let checkpPromoCodeUnique = (req, res, next) => {
    let condition = {
        promocode: req.body.promocode,
    };
    crudModel.findOne(condition, offerSchema, (err, promocode) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "error occured in checkpPromoCodeUnique",
                error: err,
            });
        }
        if (!promocode) {
            next();
        } else {
            return res.status(201).json({
                success: false,
                message: "promocode already exists in the system",
            });
        }
    });
};

let addNewPromoCode = (req, res) => {
    let promocodeData = req.body;
    let startDate = new Date(promocodeData.startDate);
    let expireDate = new Date(promocodeData.expireDate);
    let offset = expireDate.getTimezoneOffset();
    expireDate = new Date(expireDate.getTime() - offset * 60000);
    expireDate = new Date(expireDate.setHours(23, 59, 59));
    startDate = new Date(startDate.getTime() - offset * 60000);
    startDate = new Date(startDate.setHours(0, 0, 0));
    promocodeData["startDate"] = startDate;
    promocodeData["expireDate"] = expireDate;
    promocodeData["created"] = new Date().getTime();
    promocodeData["updated"] = new Date().getTime();
    promocodeData["date"] = new Date();
    crudModel.create(promocodeData, offerSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "error occurred",
                error: err,
            });
        } else {
            return res
                .status(200)
                .json({ success: true, message: "added successfully" });
        }
    });
};

module.exports = [
    checkAffilateUser,
    offerType,
    checkpPromoCodeUnique,
    addNewPromoCode,
];
