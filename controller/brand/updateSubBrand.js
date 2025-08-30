"use strict";

let crudModel = require("../../sharedmb/models/crud");
let brandSchema = require("../../sharedmb/schema/brand");
let utility = require("../../sharedmb/utility/utility");
let MESSAGE = require("./message"); 

let updateSubBrand = async (req, res) => {
    try {
        if (!req.body.id || !req.body.name) {
            return res.status(400).json({
                error: true,
                message: "ID and name are required fields",
                success: false,
            });
        }

        let updateData = {
            name: req.body.name,
            _name: utility.removeSpecialCharAndDash(req.body.name),
            lName: req.body.name.toLowerCase(),
            description: req.body.name, 
            lDescription: req.body.name.toLowerCase(),
            updated: new Date().getTime(),
        };

        let condition = { _id: req.body.id };
        let options = { new: true }; 

        crudModel.updateOne(
            condition,
            updateData,
            options,
            brandSchema,
            (err, updatedBrand) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: "Error updating sub-brand",
                        success: false,
                        error: err.message || err,
                    });
                } 
                else if (updatedBrand && updatedBrand.modifiedCount > 0) {
                    return res.status(200).json({
                        success: true, 
                        message: "Sub-brand updated successfully",
                        data: updatedBrand,
                    });
                } 
                else if (updatedBrand && updatedBrand.n > 0 && updatedBrand.modifiedCount === 0) {
                    return res.status(200).json({
                        success: true,
                        message: "Sub-brand found but no changes were made (data was already up to date)",
                        data: updatedBrand,
                    });
                }
                else {
                    return res.status(404).json({
                        success: false,
                        message: "Sub-brand not found with the provided ID",
                    });
                }
            }
        );

    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
            success: false,
            error: err.message || err,
        });
    }
};

module.exports = updateSubBrand;