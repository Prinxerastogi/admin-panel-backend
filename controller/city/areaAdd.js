"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    citySchema = require("../../sharedmb/schema/city"),
    MESSAGE = require("./message");

let addArea = (req, res) => {
    let data = req.body;
    tempCoordinates = [];
    if (data.area.length == 0) {
        return status(203).json({
            succes: false,
            message: MESSAGE.addarea.error,
        });
    } else {
        for (var i = 0; i < data.area.length; i++) {
            tempCoordinates.push([data.area[i].lng, data.area[i].lat]);
        }
        tempCoordinates.push([data.area[0].lng, data.area[0].lat]);
        polygon = [];
        polygon.push(tempCoordinates);
        let conditions = { _id: req.body.cityId };
        let update = {
            $set: {
                area: {
                    type: "Polygon",
                    coordinates: polygon,
                },
            },
        };
        let options = {};
        crudModel.updateOne(
            conditions,
            update,
            options,
            citySchema,
            (err, coordinates) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: MESSAGE.addarea.updateerror,
                        error: err,
                    });
                } else if (coordinates.nModified > 0 && coordinates.n > 0) {
                    return res
                        .status(200)
                        .json({ success: true, message: MESSAGE.addarea.set });
                } else {
                    return res.status(201).json({
                        success: false,
                        message: MESSAGE.addarea.notset,
                    });
                }
            }
        );
    }
};

module.exports = [addArea];
