let crudModel = require("../../sharedmb/models/crud"),
    smartListSchema = require("../../sharedmb/schema/smartList"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose")
    MESSAGE = require("./message");

let createSmartList = (req, res) => {
    let addSmartList = {
        name: req.body.name,
        _name: utility.removeSpecialCharAndDash(req.body.name),
        config: {
            category: req.body.category,
            subCategory: req.body.subCategory,
            leafCategory: req.body.leafCategory,
            brand: req.body.brand,
            subBrand: req.body.subBrand,
            minPrice: req.body.minPrice,
            maxPrice: req.body.maxPrice,
            minDiscount: req.body.minDiscount,
            maxDiscount: req.body.maxDiscount,
            tags: req.body.tags || [],
        },
        createDate: new Date(),
        isActive: req.body.isActive,
    }

    crudModel.create(addSmartList, smartListSchema, (error, newSmartList) => {
        if (error) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.savedataError,
                error: error,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: MESSAGE.add.added,
            });
        }
    });
}

module.exports = [createSmartList];