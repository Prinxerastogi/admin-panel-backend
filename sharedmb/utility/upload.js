let multer = require("multer");
let config = require("config");
let fs = require("fs");

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.exists(config.upload.tempPath, function (exists) {
            if (exists) {
                cb(null, config.upload.tempPath);
            } else {
                fs.mkdir(config.upload.tempPath, function (err) {
                    if (err) {
                        console.log("Error in folder creation");
                        cb(new Error("Error in folder creation"), false);
                    }
                    cb(null, config.upload.tempPath);
                });
            }
        });
    },
    filename: function (req, file, cb) {
        // let imageExt = file.originalname.split('.').pop();
        let imageExt = "png";
        cb(null, `${Date.now()}.${imageExt}`);
    },
});

let upload = multer({ storage: storage });
module.exports = upload;
