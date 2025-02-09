let crudModel = require("../../sharedmb/models/crud"),
    brandSchema = require("../../sharedmb/schema/brand"),
    validate = require("express-validation"),
    validation = require("./validation"),
    config = require("config"),
    async = require("async"),
    fs = require("fs-extra"),
    utility = require("../../sharedmb/utility/utility");
let MESSAGE = require("./message");

let createNewBrand = (req, res, next) => {
    let data = {
        name: req.body.name,
        _name: utility.removeSpecialCharAndDash(req.body.name),
        lName: req.body.name,
        image: req.body.image,
        tags: req.body.tags,
        isRootBrand: true,
        description: req.body.description,
        lDescription: req.body.description,
        updated: new Date().getTime(),
        created: new Date().getTime(),
        date: new Date(),
    };
    crudModel.create(data, brandSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: MESSAGE.add.errornewbrand,
                success: false,
                error: err,
            });
        } else {
            req.data = response;
            if (req.body.image) {
                next();
            } else {
                return res
                    .status(200)
                    .json({ success: true, message: MESSAGE.add.added });
            }
        }
    });
};

let copybrandImage = (req, res, next) => {
    req.body.image = [req.body.image];
    let dstPath = `${config.upload.brandImagePath}${req.data.id}/`;
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
                return res
                    .status(200)
                    .json({ success: true, message: MESSAGE.add.added });
            }
        }
    );
};

module.exports = [
    validate(validation.addBrand),
    createNewBrand,
    copybrandImage,
];
