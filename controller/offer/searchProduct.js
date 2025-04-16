"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    offerSchema = require("../../sharedmb/schema/offer"),
    productSchema = require("../../sharedmb/schema/product"),
    uid = require("uid");

let searchProducts = (req, res) => {
    const searchTerm = req.query.term;
    const query = searchTerm
        ? { name: { $regex: searchTerm, $options: "i" } }
        : {};

    crudModel.find(query, productSchema, (err, products) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Error searching products",
                error: err,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Products found",
            data: products,
        });
    });
};

module.exports = [searchProducts];