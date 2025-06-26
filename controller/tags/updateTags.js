"use strict";
const crudModel = require("../../sharedmb/models/crud");
const tagsSchema = require("../../sharedmb/schema/tags");
const productSchema = require("../../sharedmb/schema/product");
const utility = require("../../sharedmb/utility/utility");
const mongoose = require("mongoose");
const MESSAGE = require("./message");

const sanitizeProducts = (products) => {
    if (!Array.isArray(products)) return [];
    return products.map(id => {
        const num = Number(id);
        return isNaN(num) ? 0 : Math.abs(Math.floor(num));
    }).filter(id => id > 0);
};

const validateTagId = (req, res, next) => {
    try {
        req.body.tag_id = mongoose.Types.ObjectId(req.body.tag_id);
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Invalid tag ID format",
            error: err.message
        });
    }
};

let findTag = (req, res, next) => {
    const conditions = {
        _id: req.body.tag_id
    };
    crudModel.findOne(conditions, tagsSchema, (err, tags) => {
        if (err) {
            return res.status(400).json({ 
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (!tags) {
            return res.status(404).json({ 
                success: false, 
                message: `Tag Not Found` 
            });
        }
        next();
    });
};

let updatetags = (req, res) => {
    const sanitizedProducts = sanitizeProducts(req.body.products);
    const tagId = req.body.tag_id; 
    
    const condition = { _id: tagId };
    const update = {
        name: req.body.tag_name,
        _name: utility.removeSpecialCharAndDash(req.body.tag_name),
        urlkey: utility.removeSpecialCharAndDash(req.body.tag_name),
        isActive: req.body.isActive,
        updateDate: new Date(),
    };

    tagsSchema.findOneAndUpdate(condition, update, (error, updated) => {
        if (error) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.savedataError,
                error: error,
            });
        }

        if (sanitizedProducts.length > 0) {
            productSchema.updateMany(
                { tags: tagId }, 
                { $pull: { tags: tagId } }, 
                (removeError, removeResult) => {
                    if (removeError) {
                        return res.status(400).json({
                            error: true,
                            success: false,
                            message: MESSAGE.add.savedataError,
                            error: removeError,
                        });
                    }
                    const bulkOps = sanitizedProducts.map(prodId => ({
                        updateOne: {
                            filter: { id: prodId },
                            update: { $addToSet: { tags: tagId } } 
                        }
                    }));

                    productSchema.bulkWrite(bulkOps, (bulkError, bulkResult) => {
                        if (bulkError) {
                            return res.status(400).json({
                                error: true,
                                success: false,
                                message: MESSAGE.add.savedataError,
                                error: bulkError,
                            });
                        }
                        return res.status(200).json({
                            success: true,
                            message: MESSAGE.add.update,
                            updatedProducts: bulkResult.modifiedCount
                        });
                    });
                }
            );
        } else {
            return res.status(200).json({ 
                success: true, 
                message: MESSAGE.add.update 
            });
        }
    });
};

module.exports = [validateTagId, findTag, updatetags];