let crud = require("../../sharedmb/models/crud");
let product = require("../../sharedmb/schema/product");
let fs = require("fs-extra");
let config = require("config");
let async = require("async");
let validate = require("express-validation");
let validation = require("./validation");
let gm = require("gm").subClass({ imageMagick: true });

let findProductAndUpdateIMGinDB = (req, res, next) => {
    req.data = {};
    crud.findOne({ _id: req.body.productId }, product, (err, product) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in findProductAndUpdateIMGinDB ",
                err,
            });
        }
        if (product) {
            req.data.product = product;
            next();
        } else {
            return res
                .status(201)
                .json({ success: false, message: "no product found" });
        }
    });
};

let moveImagefromTempToServer = require("../image/moveImageFromTempFolder");

let copyImageFromTempToServer = (req, res, next) => {
    let product = req.data.product;
    let folderName = product.id;
    req.data.folderName = folderName;
    let dstPath = `${config.upload.productImagePath}${folderName}/`;
    req.data.dstPath = dstPath;
    moveImagefromTempToServer(req.body.images, dstPath, (err, results) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "something went wrong  ",
                err,
            });
        } else {
            next();
        }
    });
};

//create variante

let createImageVariantController = require("../image/imageVariant");

let createImageVariant = (req, res, next) => {
    async.each(
        req.body.images,
        (image, callback) => {
            createImageVariantController(
                req.data.dstPath,
                image,
                (err, result) => {
                    if (err) {
                        callback({
                            error: true,
                            success: false,
                            message: "error in createImageVariant",
                            err,
                        });
                    } else {
                        callback();
                    }
                }
            );
        },
        (err) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                    success: false,
                    message: "error in createImageVariant",
                    errMsg: err.message,
                });
            } else {
                next();
            }
        }
    );
};

let updateImages = (req, res) => {
    crud.updateOne(
        { _id: req.body.productId },
        {
            $push: {
                images: { $each: req.body.images },
            },
        },
        {},
        product,
        (err, updated) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: "something went wrong in updating images",
                    err,
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "updated successfully",
                    response: req.body.productId,
                });
            }
        }
    );
};

module.exports = [
    validate(validation.updateProductImage),
    findProductAndUpdateIMGinDB,
    copyImageFromTempToServer,
    // createImageVariant,
    // moveImageOnserver,
    updateImages,
];
