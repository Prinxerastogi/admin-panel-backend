"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    membershipSchema = require("../../sharedmb/schema/membership"),
    config = require("config"),
    async = require("async"),
    fs = require("fs-extra"),
    MESSAGE = require("./message");

let copyMemberShipImage = (req, res, next) => {
    let data = req.body;
    let folderName = data.name.toLowerCase().replace(/ /g, "-");
    let dstPath = `${config.upload.memberShipImagePath}${folderName}/`;
    async.each(
        req.body.images,
        (image, callback) => {
            fs.ensureDir(dstPath, (err) => {
                let srcPath = config.upload.tempPath + image;
                let dstFilePath = dstPath + image;
                fs.move(srcPath, dstFilePath, (err) => {
                    if (err) {
                        callback({
                            error: true,
                            success: false,
                            message: MESSAGE.add.error,
                            err,
                        });
                    } else {
                        callback();
                    }
                });
            });
        },
        function (err) {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.add.error,
                    err,
                });
            } else {
                next();
            }
        }
    );
};

let createMemberShipData = (req, res) => {
    let membershipData = req.body;
    membershipData["created"] = new Date().getTime();
    membershipData["updated"] = new Date().getTime();
    (membershipData["images"] = req.body.images),
        crudModel.create(membershipData, membershipSchema, (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.add.createError,
                    error: err,
                });
            }
            if (response == null) {
                return res
                    .status(201)
                    .json({ success: false, message: MESSAGE.add.notsaved });
            } else {
                return res
                    .status(200)
                    .json({ success: true, message: MESSAGE.add.saved });
            }
        });
};

module.exports = [copyMemberShipImage, createMemberShipData];
