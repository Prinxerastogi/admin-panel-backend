var upload = require("../../sharedmb/utility/upload");
let schema = require("../../sharedmb/schema/image");
let crudModel = require("../../sharedmb/models/crud");
let config = require("config");
let MESSAGE = require("./message");

let uploadImage = (req, res, next) => {
    req.data = {};
    upload.single("image")(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.image.error,
                err,
            });
        } else {
            req.data.file = req.file;
            next();
        }
    });
};

let checkFile = (req, res, next) => {
    let file = req.data.file;
    if (file == undefined) {
        return res.status(400).json({
            error: true,
            success: false,
            message: MESSAGE.image.notempty,
        });
    } else {
        return res.status(200).json({
            error: false,
            success: true,
            message: MESSAGE.image.success,
            path: file,
        });
    }
};

module.exports = [
    uploadImage,
    checkFile,
    //savePath
];
