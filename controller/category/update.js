"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    categorySchema = require("../../sharedmb/schema/category"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    async = require("async"),
    fs = require("fs-extra"),
    MESSAGE = require("./message"),
    mongoose = require("mongoose");

let findUrlCategory = (req, res, next) => {
    let condition = {};
    let name;
    if (req.body.name && req.body.urlKey) {
        name = utility.removeSpecialCharAndDash(req.body.name);
        condition = {
            $or: [
                { name: name },
                { _name: name },
                {
                    urlKey: req.body.urlKey,
                },
            ],
        };
    } else if (req.body.name) {
        name = utility.removeSpecialCharAndDash(req.body.name);
        condition = {
            $or: [{ name: name }, { _name: name }],
        };
    } else if (req.body.urlKey) {
        condition = {
            urlKey: req.body.urlKey,
        };
    } else {
        condition = {
            _id: null,
        };
    }
    crudModel.findOne(condition, categorySchema, (error, response) => {
        if (error)
            return res.status(400).json({
                error: error,
                success: false,
                message: MESSAGE.addroot.error,
            });
        else if (response == null) next();
        else if (response != null)
            return res.status(201).json({
                success: false,
                message: MESSAGE.addroot.url,
                data: response,
            });
        else
            return res
                .status(400)
                .json({ message: MESSAGE.addroot.unknown, success: false });
    });
};

let findCategory = (req, res, next) => {
    req.data = {};
    crudModel.findOne(
        { _id: req.body._id },
        categorySchema,
        (err, category) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in findCategory ",
                    err,
                });
            }
            if (category) {
                req.data.category = category;
                next();
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: "no category found" });
            }
        }
    );
};

let moveImageOnserver = (req, res, next) => {
    req.data.folderName = req.data.category.id;
    let dstPath = `${config.upload.categoryImagePath}${req.data.folderName}/`;
    req.data.dstPath = dstPath;
    if (req.body.tempImages && req.body.tempImages.length > 0) {
        async.each(
            req.body.tempImages,
            function (image, callback) {
                fs.ensureDir(dstPath, (err) => {
                    let srcPath = config.upload.tempPath + image;
                    let dstFilePath = dstPath + image;
                    fs.move(srcPath, dstFilePath, (err) => {
                        if (err) {
                            callback({
                                error: true,
                                success: false,
                                message:
                                    "message.category.image update.error.message",
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
                        message: "message.category.update.error.message",
                        err,
                    });
                } else {
                    next();
                }
            }
        );
    } else {
        next();
    }
};

const uploadImage = async (req, res, next) => {
    try {
        if (!req.body.tempCategoryBanners) {
            return next();
        }
        let tempImages = req.body.tempCategoryBanners;
        let dstPath = `${config.upload.banner}`;

        await fs.ensureDir(dstPath);
        await Promise.all(
            tempImages?.map(async (image) => {
                let srcPath = `${config.upload.tempPath}${image}`;
                let dstFilePath = `${dstPath}${image}`;

                try {
                    await fs.access(srcPath);
                    await fs.move(srcPath, dstFilePath);
                } catch (err) {
                    console.error("Error moving file:", err);
                    throw {
                        error: true,
                        success: false,
                        message: "message.banner.add.error.message",
                        err,
                    };
                }
            })
        );

        next();
    } catch (err) {
        console.error("Error in uploadImage:", err);
        res.status(500).json({
            error: true,
            success: false,
            message: "message.banner.add.error.message",
            err,
        });
    }
};

let updateCategory = (req, res, next) => {
    let Option = { new: true };
    let updateOtherData = {};
    updateOtherData.$set = {};
    if (req.body.name) {
        updateOtherData.$set.name = req.body.name;
        updateOtherData.$set._name = utility.removeSpecialCharAndDash(
            req.body.name
        );
        req.data.folderName = utility.removeSpecialCharAndDash(req.body.name);
        req.data.isFolderName = true;
    }
    if (req.body.commission) {
        updateOtherData.$set.commission = Number(req.body.commission);
    }
    if (req.body.isActive != null) {
        updateOtherData.$set.isActive = req.body.isActive;
    }
    if (req.body.priority) {
        updateOtherData.$set.priority = req.body.priority;
    }
    if (req.body.offertext) {
        updateOtherData.$set.offertext = req.body.offertext;
    }
    if (req.body.categoryBanners) {
        updateOtherData.$set.categoryBanners = req.body.categoryBanners;
    }
    if (req.body.seo) {
        updateOtherData.$set.seo = req.body.seo;
    }
    if (req.body.urlKey) {
        updateOtherData.$set.urlKey = req.body.urlKey;
    }
    if (req.body.images == null || req.body.images.length == 0) {
        delete req.body.images;
    }
    if (req.body && req.body.images && req.body.images.length > 0) {
        updateOtherData.$push = {};
        updateOtherData.$set.images = [req.body.images[0]];
    }
    if (req.body.nutritionalBaseQuantity) { 
        updateOtherData.$set.nutritionalBaseQuantity = Number(req.body.nutritionalBaseQuantity);
    }
    
    crudModel.findOneAndUpdate(
        { _id: req.body._id },
        updateOtherData,
        Option,
        categorySchema,
        (err, updated) => {
            if (err) {
                return res
                    .status(400)
                    .json({ success: false, message: "error", err });
            } else {
                res.status(200).json({
                    success: true,
                    message: "updated successfully",
                    updated,
                });
                req.data.oldFolderName = updated._name;
                next();
            }
        }
    );
};

let updateFolderName = (req, res) => {
    if (req.data.isFolderName && req.data.folderName) {
        fs.rename(
            `${config.upload.categoryImagePath}${req.data.oldFolderName}`,
            `${config.upload.categoryImagePath}${req.data.folderName}`,
            (err, folderUpdate) => {
                if (err) {
                    console.log(
                        "something went wrong in updateFolderName" + err
                    );
                    //  return res.status(400).json({ success: false, message: 'something went wrong in updateFolderName', err })
                } else {
                    return 1;
                }
            }
        );
    } else {
        return 1;
    }
};

module.exports = [
    //    findUrlCategory,
    findCategory,
    moveImageOnserver,
    uploadImage,
    updateCategory,
    // updateFolderName,
];
