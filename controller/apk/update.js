let crudModel = require("../../sharedmb/models/crud"),
    apkSchema = require("../../sharedmb/schema/apk");

let update = (req, res) => {
    const now = new Date().getTime();
    req.body.isActive = false;
    req.body.updated = now;
    let update = {
        $set: req.body,
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

module.exports = [update];
