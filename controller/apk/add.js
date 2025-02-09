let crudModel = require("../../sharedmb/models/crud"),
    apkSchema = require("../../sharedmb/schema/apk"),
    utility = require("../../sharedmb/utility/utility"),
    async = require("async"),
    fs = require("fs-extra"),
    config = require("config");

let copyImage = (req, res, next) => {
    req.data = {};
    let data = req.body;
    let folderName = utility.removeSpecialCharAndDash(data.name);
    req.data.folderName = folderName;
    let dstPath = `${config.upload.apkFilePath}${folderName}/`;
    req.data.dstPath = dstPath;
    req.body.files = [];
    req.body.files.push(req.body.file);
    async.each(
        req.body.files,
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
                            message: "message.product.add.error.message",
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
                    message: "message.product.add.error.message",
                    err,
                });
            } else {
                console.log("All files have been processed successfully");
                next();
            }
        }
    );
};

let addBlog = (req, res) => {
    const now = new Date().getTime();
    req.body.updated = now;
    req.body.created = now;
    req.body.date = new Date();

    crudModel.create(req.body, apkSchema, (err, created) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "error occured in addblog",
                err,
            });
        if (created)
            return res.status(200).json({
                success: true,
                message: " add successfully",
                apk: created,
            });
        else
            return res.status(201).json({
                success: false,
                message: "something went wrong in data",
            });
    });
};

module.exports = [copyImage, addBlog];
