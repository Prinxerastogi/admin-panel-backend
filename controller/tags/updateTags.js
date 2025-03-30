"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    tagsSchema = require("../../sharedmb/schema/tags"),
    productSchema = require("../../sharedmb/schema/product"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let findTag = (req, res, next) => {
    let conditions = {
        _id: req.body.tag_id,
    };
    crudModel.findOne(conditions, tagsSchema, (err, tags) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (tags != null) {
            next();
        } else if (tags == null) {
            // return res.status(201).json({ success: false, message: `${tags.name} already added in this tags` })
            return res
                .status(201)
                .json({ success: false, message: `Tag Not Found` });
        } else {
            return res
                .status(500)
                .json({ success: true, message: MESSAGE.add.unknown });
        }
    });
};
let updatetags = (req, res) => {
    let condition = {
        _id: req.body.tag_id,
    };
    let update = {
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
        } else {
            if (req.body.products) {
                //remove tag from all products having this tag earlier
                productSchema.updateMany(
                    { tags: [req.body.tag_id] },
                    { $set: { tags: [] } },
                    (error, updated) => {
                        if (error) {
                            return res.status(400).json({
                                error: true,
                                success: false,
                                message: MESSAGE.add.savedataError,
                                error: error,
                            });
                        } else {
                            req.body.products.forEach((prodId, index) => {
                                productSchema.findOneAndUpdate(
                                    { id: Number(prodId) },
                                    { $push: { tags: req.body.tag_id } },
                                    (error, updated) => {
                                        if (error) {
                                            return res.status(400).json({
                                                error: true,
                                                success: false,
                                                message:
                                                    MESSAGE.add.savedataError,
                                                error: error,
                                            });
                                        }
                                    }
                                );
                            });
                            return res.status(200).json({
                                success: true,
                                message: `${MESSAGE.add.update}`,
                            });
                        }
                    }
                );
            } else {
                return res
                    .status(200)
                    .json({ success: true, message: MESSAGE.add.update });
            }
        }
    });
};
module.exports = [findTag, updatetags];
