let createImageVariant = require("../image/imageVariant"),
    config = require("config"),
    fs = require("fs-extra"),
    async = require("async");

module.exports = (images, dstPath, callback1) => {
    async.each(
        images,
        function (image, callback) {
            fs.ensureDir(dstPath, (err) => {
                let srcPath = config.upload.tempPath + image;
                let dstFilePath = dstPath + image;
                console.log(dstFilePath, srcPath);
                fs.move(srcPath, dstFilePath, (err) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            });
        },
        function (err) {
            if (err) {
                callback1(err, null);
            } else {
                callback1(null, "success");
            }
        }
    );
};
