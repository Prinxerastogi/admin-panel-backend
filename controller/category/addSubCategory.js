"use strict";
let categorySchema = require("../../sharedmb/schema/category"),
    crudModel = require("../../sharedmb/models/crud"),
    mongoose = require("mongoose"),
    config = require("config"),
    fs = require("fs-extra"),
    async = require("async"),
    ObjectId = mongoose.Types.ObjectId,
    validate = require("express-validation"),
    validation = require("./validation"),
    utility = require("../../sharedmb/utility/utility"),
    imageSchema = require("../../sharedmb/schema/image"),
    MESSAGE = require("./message");

let findCategory = (req, res, next) => {
    req.data = {};
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
                message: MESSAGE.addsubcategory.error,
            });
        else if (response == null) next();
        else if (response != null)
            return res.status(201).json({
                success: false,
                message: MESSAGE.addsubcategory.change,
            });
        else
            return res.status(400).json({
                message: MESSAGE.addsubcategory.unknown,
                success: false,
            });
    });
};

let checkParentOfCategory = (req, res, next) => {};

let checkRootCategory = (req, res, next) => {};

let findMaxCategoryCode = (req, res, next) => {
    let condition = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.body.parentId),
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "childIds",
                foreignField: "_id",
                as: "childs",
            },
        },
        {
            $addFields: {
                code: {
                    $cond: [
                        {
                            $gt: [
                                {
                                    $size: "$childs",
                                },
                                0,
                            ],
                        },
                        {
                            $toString: {
                                $add: [
                                    {
                                        $max: {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: "$childs",
                                                        as: "child",
                                                        cond: {
                                                            $eq: [
                                                                "$$child.parentId",
                                                                mongoose.Types.ObjectId(
                                                                    req.body
                                                                        .parentId
                                                                ),
                                                            ],
                                                        },
                                                    },
                                                },
                                                as: "data",
                                                in: {
                                                    $toInt: "$$data.code",
                                                },
                                            },
                                        },
                                    },
                                    1,
                                ],
                            },
                        },
                        {
                            $concat: ["$code", "01"],
                        },
                    ],
                },
            },
        },
    ];
    //  [
    //     {
    //         '$match': {
    //             'parentId': mongoose.Types.ObjectId(req.body.parentId),
    //             isRoot: false
    //             //'isRoot': Boolean(req.body.isRoot),
    //             //'isLeaf': Boolean(req.body.isLeaf)
    //         }
    //     }, {
    //         '$lookup': {
    //             'from': 'categories',
    //             'localField': 'parentId',
    //             'foreignField': '_id',
    //             'as': 'parent'
    //         }
    //     }, {
    //         '$unwind': {
    //             'path': '$parent'
    //         }
    //     }, {
    //         '$addFields': {
    //             'IntCode': {
    //                 '$max': {
    //                     '$toInt': '$code'
    //                 }
    //             }
    //         }
    //     }, {
    //         '$group': {
    //             '_id': 'null',
    //             'maxCode': {
    //                 '$max': '$IntCode'
    //             },
    //             'code': {
    //                 '$last': '$code'
    //             },
    //             'parentCode': {
    //                 '$first': '$parent.code'
    //             },
    //             'count': {
    //                 '$sum': 1
    //             }
    //         }
    //     }, {
    //         '$addFields': {
    //             'countString': {
    //                 '$toString': '$count'
    //             }
    //         }
    //     }, {
    //         '$addFields': {
    //             'code': {
    //                 '$cond': [
    //                     {
    //                         '$gt': [
    //                             '$count', 0
    //                         ]
    //                     }, {
    //                         '$concat': [
    //                             '$parentCode', {
    //                                 '$cond': [
    //                                     {
    //                                         '$gt': [
    //                                             {
    //                                                 '$strLenCP': '$countString'
    //                                             }, 1
    //                                         ]
    //                                     }, {
    //                                         '$concat': [
    //                                             '0', '$countString'
    //                                         ]
    //                                     }, {
    //                                         '$concat': [
    //                                             '0', {
    //                                                 '$toString': {
    //                                                     '$add': [
    //                                                         '$count', 1
    //                                                     ]
    //                                                 }
    //                                             }
    //                                         ]
    //                                     }
    //                                 ]
    //                             }
    //                         ]
    //                     }, {
    //                         '$concat': [
    //                             '$parentCode', '01'
    //                         ]
    //                     }
    //                 ]
    //             }
    //         }
    //     }
    // ]

    // [
    //     {
    //         '$facet': {
    //             'level1': [
    //                 {
    //                     '$match': {
    //                         'parentId': mongoose.Types.ObjectId(req.body.parentId),
    //                         'isRoot': false
    //                     }
    //                 }, {
    //                     '$lookup': {
    //                         'from': 'categories',
    //                         'localField': 'parentId',
    //                         'foreignField': '_id',
    //                         'as': 'parent'
    //                     }
    //                 }, {
    //                     '$unwind': {
    //                         'path': '$parent'
    //                     }
    //                 }, {
    //                     '$addFields': {
    //                         'IntCode': {
    //                             '$max': {
    //                                 '$toInt': '$code'
    //                             }
    //                         }
    //                     }
    //                 }, {
    //                     '$group': {
    //                         '_id': 'null',
    //                         'maxCode': {
    //                             '$max': '$IntCode'
    //                         },
    //                         'code': {
    //                             '$last': '$code'
    //                         },
    //                         'parentCode': {
    //                             '$first': '$parent.code'
    //                         },
    //                         'count': {
    //                             '$sum': 1
    //                         }
    //                     }
    //                 }, {
    //                     '$addFields': {
    //                         'countString': {
    //                             '$toString': '$count'
    //                         }
    //                     }
    //                 }, {
    //                     '$addFields': {
    //                         'code': {
    //                             '$cond': [
    //                                 {
    //                                     '$gt': [
    //                                         '$count', 0
    //                                     ]
    //                                 }, {
    //                                     '$concat': [
    //                                         '$parentCode', {
    //                                             '$cond': [
    //                                                 {
    //                                                     '$gt': [
    //                                                         {
    //                                                             '$strLenCP': '$countString'
    //                                                         }, 1
    //                                                     ]
    //                                                 }, {
    //                                                     '$concat': [
    //                                                         '0', '$countString'
    //                                                     ]
    //                                                 }, {
    //                                                     '$concat': [
    //                                                         '0', {
    //                                                             '$toString': {
    //                                                                 '$add': [
    //                                                                     '$count', 1
    //                                                                 ]
    //                                                             }
    //                                                         }
    //                                                     ]
    //                                                 }
    //                                             ]
    //                                         }
    //                                     ]
    //                                 }, {
    //                                     '$concat': [
    //                                         '$parentCode', '01'
    //                                     ]
    //                                 }
    //                             ]
    //                         }
    //                     }
    //                 }
    //             ],
    //             'level2': [
    //                 {
    //                     '$match': {
    //                         '_id': mongoose.Types.ObjectId(req.body.parentId),
    //                         'isRoot': true
    //                     }
    //                 }, {
    //                     '$addFields': {
    //                         'IntCode': {
    //                             '$max': {
    //                                 '$toInt': '$code'
    //                             }
    //                         }
    //                     }
    //                 }, {
    //                     '$group': {
    //                         '_id': 'null',
    //                         'maxCode': {
    //                             '$max': '$IntCode'
    //                         },
    //                         'code': {
    //                             '$last': '$code'
    //                         },
    //                         'count': {
    //                             '$sum': 1
    //                         }
    //                     }
    //                 }, {
    //                     '$addFields': {
    //                         'countString': {
    //                             '$toString': '$count'
    //                         }
    //                     }
    //                 }, {
    //                     '$addFields': {
    //                         'code': {
    //                             '$cond': [
    //                                 {
    //                                     '$gt': [
    //                                         '$count', 0
    //                                     ]
    //                                 }, {
    //                                     '$concat': [
    //                                         '$code', {
    //                                             '$cond': [
    //                                                 {
    //                                                     '$gte': [
    //                                                         {
    //                                                             '$strLenCP': '$countString'
    //                                                         }, 1
    //                                                     ]
    //                                                 }, {
    //                                                     '$concat': [
    //                                                         '0', '$countString'
    //                                                     ]
    //                                                 }, {
    //                                                     '$concat': [
    //                                                         '0', {
    //                                                             '$toString': {
    //                                                                 '$add': [
    //                                                                     '$count', 1
    //                                                                 ]
    //                                                             }
    //                                                         }
    //                                                     ]
    //                                                 }
    //                                             ]
    //                                         }
    //                                     ]
    //                                 }, {
    //                                     '$concat': [
    //                                         '$code', '01'
    //                                     ]
    //                                 }
    //                             ]
    //                         }
    //                     }
    //                 }
    //             ]
    //         }
    //     }, {
    //         '$addFields': {
    //             'level1Size': {
    //                 '$size': '$level1'
    //             },
    //             'level2Size': {
    //                 '$size': '$level2'
    //             }
    //         }
    //     }, {
    //         '$unwind': {
    //             'path': '$level1',
    //             'includeArrayIndex': '0',
    //             'preserveNullAndEmptyArrays': true
    //         }
    //     }, {
    //         '$unwind': {
    //             'path': '$level2',
    //             'includeArrayIndex': '1',
    //             'preserveNullAndEmptyArrays': true
    //         }
    //     }, {
    //         '$addFields': {
    //             'code': {
    //                 '$cond': [
    //                     {
    //                         '$gt': [
    //                             '$level1Size', 0
    //                         ]
    //                     }, '$level1.code', '$level2.code'
    //                 ]
    //             }
    //         }
    //     }
    // ]
    crudModel.aggregation(condition, categorySchema, (err, code) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.addsubcategory.updateerror,
                error: err,
            });
        } else if (code && code.length > 0) {
            req.data.code = code[0].code;
            next();
        } else {
            return res
                .status(201)
                .json({ success: false, message: "category code not found" });
        }
    });
};

let addCategory = (req, res, next) => {
    let parentId = req.body.parentId;
    let parentIds = req.body.parentIds.map((_) => {
        return mongoose.Types.ObjectId(_);
    });
    parentIds.push(mongoose.Types.ObjectId(parentId));
    // parentIds.push(ObjectId(req.body.parentId));
    req.data.parentIds = parentIds;
    req.body.attributes = req.body.attributes.map((_) => {
        return ObjectId(_);
    });
    let data = {
        isRoot: false,
        isLeaf: req.body.isLeaf,
        name: req.body.name,
        _name: utility.removeSpecialCharAndDash(req.body.name),
        isActive: true,
        parentId: ObjectId(req.body.parentId),
        parentIds: parentIds,
        parentIntId: req.body.parentIntId,
        images: req.body.images,
        seo: req.body.seo,
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

        images: req.body.images,
        attributes: req.body.attributes,
        commission: req.body.commission,
        urlKey: utility.removeSpecialCharAndDash(req.body.urlKey),
        date: new Date(),
        updated: new Date().getTime(),
        created: new Date().getTime(),
        code: req.data.code,
        priority: Number(req.body.priority),
        level: req.body.isLeaf ? 2 : 1,
        // isRoot: false, isLeaf: false level1
        // isRoot: false, isLeaf: true level2
    };
    crudModel.create(data, categorySchema, (error, response) => {
        if (error)
            return res.status(400).json({
                error: error,
                success: false,
                message: MESSAGE.addsubcategory.addcategory,
            });
        else {
            req.data.catId = response._id;
            req.data.response = response;
            next();
        }
    });
};

let copyProductImage = (req, res, next) => {
    let data = req.data.response;
    let folderName = data.id;
    req.data.folderName = folderName;
    let dstPath = `${config.upload.categoryImagePath}${folderName}/`;
    req.data.dstPath = dstPath;
    async.each(
        data.images,
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
                            message: MESSAGE.addsubcategory.errorcopy,
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
                    message: MESSAGE.addsubcategory.error,
                    err,
                });
            } else {
                console.log("image move successfully!");
                next();
            }
        }
    );
};

let findParentAndUpdate = (req, res, next) => {
    let catId = req.data.catId;
    let response = req.data.response;
    let condition = {
            _id: { $in: req.data.parentIds.map((_) => _) },
        },
        update = {
            $push: {
                childIds: mongoose.Types.ObjectId(catId),
            },
        },
        Option = {};

    crudModel.updateMany(
        condition,
        update,
        Option,
        categorySchema,
        (err, updateMany) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.addsubcategory.updateerror,
                    error: err,
                });
            } else if (updateMany.nModified > 0 && updateMany.n > 0) {
                res.status(200).json({
                    message: MESSAGE.addsubcategory.updatesuccess,
                    success: true,
                    response: response,
                });
                next();
            } else if (updateMany.nModified == 0 && updateMany.n == 0) {
                return res.status(200).json({
                    message: MESSAGE.addsubcategory.notadded,
                    success: false,
                });
            } else {
                return res.status(400).json({
                    error: true,
                    message: MESSAGE.addsubcategory.unexpected,
                });
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
        documentId: req.data.id,
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
    findParentAndUpdate,
    saveImagePath,
    //updateParentIds
];
