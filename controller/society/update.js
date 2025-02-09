"use strict";
let societySchema = require("../../sharedmb/schema/society"),
    utility = require("../../sharedmb/utility/utility"),
    MESSAGE = require("./message");

let updateSociety = (req, res) => {
    let condition = {
        _id: req.params.id,
    };
    let update = {
        name: req.body.society,
        _name: utility.removeSpecialCharAndDash(req.body.society),
        townShip: req.body.townShip,
        location: {
            lat: req.body.lat,
            lng: req.body.lng,
        },
        lat: req.body.lat,
        lng: req.body.lng,
    };

    societySchema.updateOne(condition, update, (error, response) => {
        if (error) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.savedataError,
                error: error,
            });
        } else if (response.nModified > 0) {
            return res
                .status(200)
                .json({ success: true, message: "location updated" });
        } else {
            return res
                .status(200)
                .json({ success: false, message: "location update failed" });
        }
    });
};

module.exports = [updateSociety];
