let infoPageSchema = require("../../sharedmb/schema/infoPage"),
    config = require("config"),
    moveImagefromTempToServer = require("../image/moveImageFromTempFolder");

let findTitlePage = (req, res, next) => {
    if (req.body.title) {
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
    } else {
        next();
    }
};

let updateInfoPage = (req, res, next) => {
    let condition = {
        id: req.params.id,
    };
    let update = {
        appPage: req.body.appPage,
        webPage: req.body.webPage,
        updated: new Date(),
    };
    if (req.body.title) {
        update["title"] = req.body.title;
    }
    infoPageSchema.updateOne(condition, update, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "error in creating info page",
                success: false,
                error: err,
            });
        } else if (response) {
            if (req.body.images && req.body.images.length > 0) {
                next();
            } else {
                return res
                    .status(201)
                    .json({ message: "info page update", success: true });
            }
        } else {
            return res
                .status(400)
                .json({ message: "info page creation failed", success: false });
        }
    });
};

let copyImageFromTempToServer = (req, res, next) => {
    let dstPath = `${config.upload.infoImagePath}${req.params.id}/`;
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
        id: req.params.id,
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
                .json({ message: "info page updated", success: true });
        }
    });
};

module.exports = [
    findTitlePage,
    updateInfoPage,
    copyImageFromTempToServer,
    updateImages,
];
