"use strict";
let categorySchema = require("../../sharedmb/schema/category"),
    crudModel = require("../../sharedmb/models/crud"),
    fs = require("fs-extra"),
    async = require("async"),
    mongoose = require("mongoose"),
    ObjectId = mongoose.Types.ObjectId,
    validate = require("express-validation"),
    validation = require("./validation"),
    utility = require("../../sharedmb/utility/utility"),
    imageSchema = require("../../sharedmb/schema/image"),
    config = require("config"),
    MESSAGE = require("./message");

let findCategory = (req, res, next) => {
    let condition = {
        urlKey: utility.removeSpecialCharAndDash(req.body.urlKey),
        isActive: true,
        isDeleted: false,
    };
    crudModel.findOne(condition, categorySchema, (error, response) => {
        if (error)
            return res.status(400).json({
                error: error,
                success: false,
                message: MESSAGE.addroot.error,
            });
        else if (response == null) next();
        else if (response != null)
            return res
                .status(201)
                .json({ success: false, message: MESSAGE.addroot.url });
        else
            return res
                .status(400)
                .json({ message: MESSAGE.addroot.unknown, success: false });
    });
};

let findMaxCategoryCode = (req, res, next) => {
    req.data = {};
    let condition = [
        {
            $match: {
                level: 0,
                isRoot: true,
            },
        },
        {
            $group: {
                _id: {
                    level: "$level",
                    isRoot: "$isRoot",
                },
                maxCode: {
                    $max: {
                        $toInt: "$code",
                    },
                },
            },
        },
        {
            $addFields: {
                code: {
                    $cond: [
                        {
                            $eq: [
                                {
                                    $strLenCP: {
                                        $toString: "$maxCode",
                                    },
                                },
                                1,
                            ],
                        },
                        {
                            $concat: [
                                "0",
                                {
                                    $toString: {
                                        $add: ["$maxCode", 1],
                                    },
                                },
                            ],
                        },
                        {
                            $concat: [
                                "0",
                                {
                                    $toString: {
                                        $add: ["$maxCode", 1],
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        {
            $addFields: {
                code: {
                    $cond: [
                        {
                            $eq: [
                                {
                                    $strLenCP: "$code",
                                },
                                3,
                            ],
                        },
                        {
                            $toString: {
                                $toInt: "$code",
                            },
                        },
                        "$code",
                    ],
                },
            },
        },
    ];
    crudModel.aggregation(condition, categorySchema, (error, maxCode) => {
        if (error)
            return res.status(400).json({
                error: error.message,
                success: false,
                message: MESSAGE.addroot.erroradd,
            });
        else if (maxCode && maxCode.length > 0) {
            req.data.maxCatCode = maxCode[0].code;
            next();
        } else {
            // return res.status(201).json({ success: false, message: 'maximum category code not found' });
            next();
        }
    });
};

let addCategory = (req, res, next) => {
    req.body.attributes = req.body.attributes.map((_) => {
        return ObjectId(_);
    });
    let data = {
        isRoot: true,
        name: req.body.name,
        _name: utility.removeSpecialCharAndDash(req.body.name),
        isActive: true,
        images: req.body.images,
        urlKey: utility.removeSpecialCharAndDash(req.body.urlKey),
        isActive: req.body.isActive,
        description: req.body.description ? req.body.description : null,
        ldescription: req.body.description
            ? utility.removeSpecialChar(req.body.description)
            : null,
        longDescription: req.body.description
            ? utility.removeSpecialChar(req.body.description)
            : null,
        shortDescription: req.body.description
            ? utility.removeSpecialCharAndDash(req.body.description)
            : null,

        seo: req.body.seo,
        parentIntId: 0,
        attributes: req.body.attributes,
        commission: req.body.commission,
        isLeaf: req.body.isLeaf,
        date: new Date(),
        updated: new Date().getTime(),
        created: new Date().getTime(),
        code: req.data.maxCatCode,
        priority: Number(req.body.priority),
        level: 0,
    };
    crudModel.create(data, categorySchema, (error, response) => {
        if (error)
            return res.status(400).json({
                error: error,
                success: false,
                message: MESSAGE.addroot.erroradd,
            });
        req.data.response = response;
        next();
    });
};

let copyProductImage = (req, res, next) => {
    let folderName = req.data.response.id;
    req.data.folderName = folderName;
    let dstPath = `${config.upload.categoryImagePath}${folderName}/`;
    req.data.dstPath = dstPath;
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
                            message: MESSAGE.addroot.copyproduct,
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
                    message: MESSAGE.addroot.errorcopy,
                    err,
                });
            } else {
                console.log(MESSAGE.addroot.success);
                next();
            }
        }
    );
};

let updateParentIds = (req, res, next) => {
    let response = req.data.response;
    let condition = {
        _id: response._id,
    };
    let update = {
        $addToSet: {
            parentIds: [],
        },
    };
    let Option = {};

    crudModel.updateOne(
        condition,
        update,
        Option,
        categorySchema,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.addroot.errorupdate,
                    error: err,
                });
            } else {
                res.status(200).json({
                    message: MESSAGE.addroot.addcategory,
                    success: true,
                });
                next();
            }
        }
    );
};

let saveImagePath = (req) => {
    let data = {
        path: config.upload.categoryImagePath,
        folderName: req.data.folderName,
        images: req.body.images,
        schemaId: req.data.response._id,
        schemaName: "category",
    };
    crudModel.create(data, imageSchema, function (err, imagePath) {
        if (err) {
            console.log("error : ", err);
            return 1;
        } else {
            return 0;
        }
    });
};

module.exports = [
    validate(validation.addRootCat),
    findCategory,
    findMaxCategoryCode,
    addCategory,
    copyProductImage,
    updateParentIds,
    saveImagePath,
];
