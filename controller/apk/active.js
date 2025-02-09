let crudModel = require("../../sharedmb/models/crud"),
    apkSchema = require("../../sharedmb/schema/apk");

let decativeAllApk = (req, res, next) => {
    if (!req.body.apkId) {
        return res
            .status(201)
            .json({ success: false, message: "apkId is required" });
    }
    const now = new Date().getTime();
    let update = {
        $set: {
            isActive: false,
            updated: now,
        },
    };

    crudModel.updateMany({}, update, {}, apkSchema, (err, created) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in allowUser",
                err,
            });
        } else {
            next();
            // return res.status(200).json({ success: true, message: ' update successfully' });
        }
    });
};

let update = (req, res) => {
    const now = new Date().getTime();
    let update = {
        $set: {
            isActive: true,
            updated: now,
        },
    };

    crudModel.updateOne(
        { _id: req.body.apkId },
        update,
        {},
        apkSchema,
        (err, created) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in allowUser",
                    err,
                });
            } else {
                return res
                    .status(200)
                    .json({ success: true, message: " update successfully" });
            }
        }
    );
};

module.exports = [decativeAllApk, update];
