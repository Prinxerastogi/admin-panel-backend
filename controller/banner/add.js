let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/banner");

let config = require("config"),
    async = require("async"),
    fs = require("fs-extra"),
    utility = require("../../sharedmb/utility/utility");

// let findbanner = (req, res, next) => {
//     let condition = {
//         title: req.body.title
//     }
//     crud.findOne(condition, schema, (err, brand) => {
//         if (err) {
//             return res.status(400).json({ error: true, message: MESSAGE.add.error, success: false, error: err });
//         }
//         if (!brand) {
//             next();
//         }
//         else {
//             return res.status(201).json({ success: false, message: "Banner added with this name" });
//         }
//     })
// };

let createBanner = (req, res, next) => {
    let data = {
        title: req.body.title,
        //_name: utility.removeSpecialCharAndDash(req.body.name),
        priority: req.body.priority ? Number(req.body.priority) : null,
        // position: req.body.position ? req.body.position : null,
        banners: req.body.banners.map((_) => {
            return {
                image: _.image,
                name: _.name,
                // categoryId: _.categoryId,
                // subCategoryId: _.subCategoryId,
                //  priority: _.priority ? _.priority : null,
                position: _.position ? Number(_.position) : null,
                //searchKeyword: _.searchKeyword ? _.searchKeyword : null,

                searchKeywordWeb: _.searchKeywordWeb
                    ? _.searchKeywordWeb
                    : null,
                searchKeywordApp: _.searchKeywordApp
                    ? _.searchKeywordApp
                    : null,

                created: new Date().getTime(),
                updated: new Date().getTime(),
                date: new Date(),
            };
        }),
        //image: req.body.images,
        updated: new Date().getTime(),
        created: new Date().getTime(),
        date: new Date(),
        isDeleted: false,
    };
    crud.create(data, schema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "Banner Not Added.",
                success: false,
                error: err,
            });
        } else {
            req.body.id = response.id;
            next();
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
                    fs.move(srcPath, dstFilePath, (err) => {
                        if (err) {
                            callback({
                                error: true,
                                success: false,
                                message: "message.banner.add.error.message",
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
                        message: "message.banner.add.error.message",
                        err,
                    });
                } else {
                    console.log("image move done");
                    return res.status(200).json({
                        success: true,
                        message: "Banner adds successfully.",
                    });
                }
            }
        );
    } else {
        return res
            .status(200)
            .json({ success: true, message: "Banner adds successfully." });
    }
};

module.exports = [createBanner, moveBannerImage];
