var upload = require("../../sharedmb/utility/upload");

let uploadImage = (req, res, next) => {
    req.data = {};
    upload.single("image")(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "Upload Image error",
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
            message: "Image empty",
        });
    } else {
        return res.status(200).json({
            error: false,
            success: true,
            message: "Image uploaded successfully",
            path: file,
        });
    }
};

module.exports = [
    uploadImage,
    checkFile,
    //savePath
];
