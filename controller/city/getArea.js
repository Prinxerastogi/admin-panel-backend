"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    citySchema = require("../../sharedmb/schema/city"),
    MESSAGE = require("./message");

let getArea = (req, res) => {
    let conditions = {
        id: req.body.cityId,
    };
    let projection = {
        "area.coordinates": 1,
        id: 1,
    };

    crudModel.findProjectionOptionAndSort(
        conditions,
        projection,
        {},
        citySchema,
        (error, response) => {
            if (error) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.getarea.error,
                    error: error,
                });
            } else if (response && response.n > 0) {
                return res.status(200).json({
                    success: true,
                    message: MESSAGE.getarea.found,
                    response: response,
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: MESSAGE.getarea.unknown });
            }
        }
    );

    console.log(req.body);

    res.json({ response: req.body });
};

module.exports = [getArea];
