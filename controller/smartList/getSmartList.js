"use strict";
let smartListSchema = require("../../sharedmb/schema/smartList"),
    productSchema = require("../../sharedmb/schema/product"),
    mongoose = require("mongoose");
const crudModel = require("../../sharedmb/models/crud");

let getSmartList = (req, res, next) => {
    let conditions = {
        _id: req.params.smartlist_id,
    };

    crudModel.findOne(conditions, smartListSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "Error occurred while fetching the Smart List",
                error: err,
            });
        } else if (response) {
            productSchema.find({ smartList: response._id }, (err, products) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message:
                            "Error occurred while fetching associated products",
                        error: err,
                    });
                } else {
                    const productList = products.map((item) => {
                        return {
                            name: item.name,
                            barCode: item.barCode,
                            id: item.id,
                        };
                    });
                    return res.status(200).json({
                        success: true,
                        message: "Smart List found",
                        products: productList,
                        data: response,
                    });
                }
            });
        } else {
            return res
                .status(404)
                .json({ success: false, message: "Smart List not found" });
        }
    });
};

module.exports = [getSmartList];
