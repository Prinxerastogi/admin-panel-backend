let infoPageSchema = require("../../sharedmb/schema/infoPage"),
    validate = require("express-validation"),
    validation = require("./validation"),
    config = require("config"),
    moveImagefromTempToServer = require("../image/moveImageFromTempFolder");

let findTitlePage = (req, res, next) => {
    let condition = {
        title: req.body.title,
        isDelete: false,
    };
    infoPageSchema.findOne(condition, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "error in matching info page",
                success: false,
                error: err,
            });
        } else if (response) {
            return res.status(200).json({
                message:
                    "info page already exhist with this title. Either delete or change title.",
                success: false,
                infoPage: response,
            });
        } else {
            next();
        }
    });
};

let createInfoPage = (req, res, next) => {
    req.data = {};
    let create = {
        appPage: req.body.appPage,
        webPage: req.body.webPage,
        title: req.body.title,
        created: new Date(),
        updated: new Date(),
    };
    infoPageSchema.create(create, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "error in creating info page",
                success: false,
                error: err,
            });
        } else if (response) {
            req.data.infoPage = response;
            if (req.body.images && req.body.images.length > 0) {
                next();
            } else {
                return res
                    .status(201)
                    .json({ message: "info page created", success: true });
            }
        } else {
            return res
                .status(400)
                .json({ message: "info page creation failed", success: false });
        }
    });
};

let copyImageFromTempToServer = (req, res, next) => {
    let dstPath = `${config.upload.infoImagePath}${req.data.infoPage.id}/`;
    req.data.dstPath = dstPath;
    moveImagefromTempToServer(req.body.images, dstPath, (err, results) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "something went wrong in moving image",
                error: err,
            });
        } else {
            next();
        }
    });
};

let updateImages = (req, res) => {
    let condition = {
        _id: req.data.infoPage._id,
    };
    let update = {
        $push: {
            images: { $each: req.body.images },
        },
    };
    infoPageSchema.updateOne(condition, update, (err, updated) => {
        if (err) {
            res.status(400).json({
                success: false,
                message: "something went wrong in updating images",
                err,
            });
        } else {
            return res
                .status(201)
                .json({ message: "info page created", success: true });
        }
    });
};

module.exports = [
    validate(validation.create),
    findTitlePage,
    createInfoPage,
    copyImageFromTempToServer,
    updateImages,
];
