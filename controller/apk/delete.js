let crudModel = require("../../sharedmb/models/crud"),
    apkschema = require("../../sharedmb/schema/apk"),
    utility = require("../../sharedmb/utility/utility"),
    fs = require("fs-extra"),
    config = require("config");

let update = (req, res, next) => {
    const now = new Date().getTime();
    let update = {
        $set: {
            isDeleted: true,
            updated: now,
        },
    };

    crudModel.findOneAndUpdate(
        { _id: req.query.apkId },
        update,
        {},
        apkschema,
        (err, created) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in allowUser",
                    err,
                });
            } else if (created) {
                res.status(200).json({
                    success: true,
                    message: " update successfully",
                });
                req.data = {};
                req.data.apk = created;
                next();
            } else {
                return res.status(201).json({
                    success: true,
                    message: " something went wrong in delete apk",
                });
            }
        }
    );
};

let removeFile = (req, res) => {
    let folderName = utility.removeSpecialCharAndDash(req.data.apk.name);
    req.data.folderName = folderName;
    let dstPath = `${config.upload.apkFilePath}${folderName}/${req.data.apk.name.file}`;
    fs.remove(dstPath, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("all done");
        }
    });
};

module.exports = [update, removeFile];
