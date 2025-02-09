let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/referal");

let createReferalOffer = (req, res) => {
    let startDate = new Date(req.body.startDate);
    let expireDate = new Date(req.body.expiryDate);
    let offset = expireDate.getTimezoneOffset();
    expireDate = new Date(expireDate.getTime() - offset * 60000);
    expireDate = new Date(expireDate.setHours(23, 59, 59));
    startDate = new Date(startDate.getTime() - offset * 60000);
    startDate = new Date(startDate.setHours(0, 0, 0));

    let referalData = {
        status: "active",
        link: req.body.link,
        text: req.body.text,
        name: req.body.name,
        offer: {
            senderAmount: req.body.senderAmount,
            recieverAmount: req.body.receiverAmount,
        },
        valid: {
            start: startDate,
            end: expireDate,
        },
        cityId: req.body.city ? req.body.city : null,
        countLimit: req.body.count,
        type: req.body.type, // onRegistartion ,OnOrder
        created: new Date().getTime(),
        updated: new Date().getTime(),
        date: new Date(),
    };
    crud.create(referalData, schema, (err, created) => {
        if (err)
            return res.status(400).json({
                success: false,
                message: "error occured in createReferalOffer",
                err,
            });
        if (created) {
            return res.status(200).json({
                success: true,
                message: "referal offer successfully genrated",
                created,
            });
        } else {
            return res.status(201).json({
                success: false,
                message: "something went wrong in createReferalOffer",
            });
        }
    });
};

module.exports = [createReferalOffer];
