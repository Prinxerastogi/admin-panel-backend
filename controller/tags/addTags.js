"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    tagsSchema = require("../../sharedmb/schema/tags"),
    utility = require("../../sharedmb/utility/utility"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let addTags = (req, res) => {
    let addTag = {
        name: req.body.tag_name,
        _name: utility.removeSpecialCharAndDash(req.body.tag_name),
        urlkey: utility.removeSpecialCharAndDash(req.body.tag_name),
        createDate: new Date(),
        isActive: req.body.isActive,
    };
    crudModel.create(addTag, tagsSchema, (error, societyData) => {
        if (error) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.savedataError,
                error: error,
            });
        } else {
            return res
                .status(200)
                .json({ success: true, message: MESSAGE.add.added });
        }
    });
};
module.exports = [
    // findTag,
    addTags,
];
