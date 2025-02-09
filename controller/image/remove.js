"use strict";
let fs = require("fs-extra"),
    config = require("config"),
    async = require("async"),
    MESSAGE = require("./message");

let removeImage = (req, res, next) => {
    let data = req.body;
    let dstPath = `${config.upload.tempPath}`;
    async.each(
        req.body.images,
        function (image, callback) {
            let dstFilePath = dstPath + image;
            fs.remove(dstFilePath, (err) => {
                if (err) {
                    callback({
                        error: true,
                        success: false,
                        message: MESSAGE.remove.error,
                        err,
                    });
                } else {
                    callback();
                }
            });
        },
        function (err) {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.remove.removeImageError,
                    err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    error: false,
                    message: MESSAGE.remove.removed,
                });
            }
        }
    );
};

module.exports = [removeImage];
