"use strict";
let offerSchema = require("../../sharedmb/schema/offer");

let findOffer = (req, res) => {
    let condition = {
        _id: req.params.offerId,
    };
    offerSchema.findOne(condition, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in activDeactive offer",
                error: err,
            });
        }
        if (response) {
            return res.status(200).json({
                success: true,
                message: "promocode found",
                data: response,
            });
        } else {
            return res
                .status(201)
                .json({ success: true, message: "promocode not found" });
        }
    });
};

module.exports = [findOffer];
