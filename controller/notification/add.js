"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    notificationSchema = require("../../sharedmb/schema/notification"),
    config = require("config"),
    async = require("async"),
    fs = require("fs-extra"),
    validation = require("./validation"),
    validate = require("express-validation"),
    MESSAGE = require("./message");

let copyProductImage = (req, res, next) => {
    let data = req.body;
    let folderName = data.title.toLowerCase().replace(/ /g, "-");
    let dstPath = `${config.upload.notifiactionImagePath}${folderName}/`;
    async.each(
        req.body.images,
        function (image, callback) {
            fs.ensureDir(dstPath, (err) => {
                let srcPath = config.upload.tempPath + image;
                let dstFilePath = dstPath + image;
                console.log(dstFilePath, srcPath);
                fs.move(srcPath, dstFilePath, (err) => {
                    if (err) {
                        callback({
                            error: true,
                            success: false,
                            message: MESSAGE.add.error,
                            err,
                        });
                    } else {
                        console.log("success!");
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
                console.log(MESSAGE.add.addsuccess);
                next();
            }
        }
    );
};

let craeateNotificationData = (req, res) => {
    let notificationData = req.body;
    notificationData["created"] = new Date().getTime();
    notificationData["updated"] = new Date().getTime();
    notificationData["images"] = req.body.images;
    crudModel.create(notificationData, notificationSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.createNotificationError,
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

module.exports = [
    validate(validation.add),
    copyProductImage,
    craeateNotificationData,
];
