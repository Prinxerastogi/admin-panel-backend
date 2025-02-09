"use strict";
let productSchema = require("../../sharedmb/schema/product"),
    crud = require("../../sharedmb/models/crud"),
    MESSAGE = require("./message");

let findNewProducts = (req, res, next) => {
    let conditions = {};
    crud.find(conditions, productSchema, (error, response) => {
        if (error)
            return res.status(400).json({
                message: MESSAGE.newProductlist.error,
                error: error,
                success: false,
            });
        else if (response.length != 0)
            return res.status(200).json({ success: true, data: response });
        else
            return res.status(201).json({
                message: MESSAGE.newProductlist.noProductFound,
                success: false,
            });
    });
};

module.exports = [findNewProducts];
