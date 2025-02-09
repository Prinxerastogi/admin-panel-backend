let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/banner");

let config = require("config"),
    async = require("async"),
    fs = require("fs-extra"),
    utility = require("../../sharedmb/utility/utility");

let findbanner = (req, res, next) => {
    let condition = {
        _id: req.body.bannerId,
    };
    crud.findOne(condition, schema, (err, banner) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: MESSAGE.add.error,
                success: false,
                error: err,
            });
        }
        if (banner) {
            req.body.id = banner.id;
            next();
        } else {
            return res
                .status(201)
                .json({ success: false, message: "Banner not found" });
        }
    });
};

let moveBannerImage = (req, res, next) => {
    req.data = {};
    let data = req.body;
    req.body.images = [];
    //check if image upload into banner or not
    data.banners.map((_, i) => {
        _.image.map((__, j) => {
            req.body.images.push(__);
        });
    });
    if (req.body.images.length > 0) {
        let folderName = data.id;
        req.data.folderName = folderName;
        let dstPath = `${config.upload.banner}${folderName}/`;
        async.each(
            req.body.images,
            function (image, callback) {
                fs.ensureDir(dstPath, (err) => {
                    let srcPath = config.upload.tempPath + image;
                    let dstFilePath = dstPath + image;
                    console.log(dstFilePath, srcPath);
                    fs.access(srcPath, (err) => {
                        if (!err) {
                            fs.move(srcPath, dstFilePath, (err) => {
                                if (err) {
                                    callback({
                                        error: true,
                                        success: false,
                                        message:
                                            "message.banner.add.error.message",
                                        err,
                                    });
                                } else {
                                    console.log("success!");
                                    callback();
                                }
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
                        message: "message.banner.add.error.message",
                        err,
                    });
                } else {
                    console.log("image move done");
                    next();
                }
            }
        );
    } else {
        next();
    }
};

let updateAttribute = (req, res, next) => {
    let conditions = {
        _id: req.body.bannerId,
    };
    let update = {
        $set: req.body,
    };
    let options = {};
    crud.updateOne(conditions, update, options, schema, (error, response) => {
        if (error)
            return res
                .status(400)
                .json({ success: false, message: "error ", error: error });
        else if (response.nModified == 1) {
            return res.status(200).json({
                success: true,
                message: "update successfully",
                response,
            });
        } else
            return res
                .status(201)
                .json({ success: false, message: "something went wrong" });
    });
};

module.exports = [findbanner, moveBannerImage, updateAttribute];
