let crudModel = require("../../sharedmb/models/crud");
let brandSchema = require("../../sharedmb/schema/brand");
let utility = require("../../sharedmb/utility/utility");
let config = require("config");
let async = require("async");
let fs = require("fs-extra");
let MESSAGE = require("./message");

let findbarndByBrandId = (req, res, next) => {
    crudModel.findOne({ _id: req.body.brandId }, brandSchema, (err, brand) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in find brand",
                err,
            });
        }
        if (brand) {
            req.data = { brand };
            next();
        } else {
            return res
                .status(201)
                .json({ success: false, message: `brand not found` });
        }
    });
};

let copybrandImage = (req, res, next) => {
    //check if image upload into banner or not
    if (req.body.image) {
        req.body.image = [req.body.image];
        let dstPath = `${config.upload.brandImagePath}${req.data.brand.id}/`;
        async.each(
            req.body.image,
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
                    console.log(MESSAGE.add.processed);
                    next();
                }
            }
        );
    } else {
        next();
    }
};

let updateBrands = (req, res, next) => {
    let Option = {};
    if (req.body.name) {
        req.body.name = req.body.name;
        req.body._name = utility.removeSpecialCharAndDash(req.body.name);
        req.body.lName = req.body.name;
    }
    if (req.body.image == null) {
        delete req.body.image;
    }

    crudModel.updateOne(
        { _id: req.body.brandId },
        {
            $set: req.body,
        },
        Option,
        brandSchema,
        (err, updated) => {
            if (err) {
                return res
                    .status(400)
                    .json({ success: false, message: "error", err });
            } else if (updated.modifiedCount  > 0) {
                return res
                    .status(200)
                    .json({ success: true, message: "updated successfully" });
            } else {
                return res
                    .status(200)
                    .json({ success: true, message: "updated failed" });
            }
        }
    );
};

module.exports = [findbarndByBrandId, copybrandImage, updateBrands];
