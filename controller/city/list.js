"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    citySchema = require("../../sharedmb/schema/city"),
    MESSAGE = require("./message");
module.exports = (req, res) => {
    let condition = {
        isDeleted: false,
    };
    let projection = {
        name: 1,
        id: 1,
        _id: 1,
    };
    let options = {};
    crudModel.findProjectionOptionAndSort(
        condition,
        projection,
        options,
        citySchema,
        (error, response) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: MESSAGE.list.error,
                    error: error.message,
                });
            } else if (response) {
                return res.status(200).json({
                    success: true,
                    message: MESSAGE.list.found,
                    cities: response,
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: MESSAGE.list.saved });
            }
        }
    );
};
