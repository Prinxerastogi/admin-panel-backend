let config = require("config");
let moveImagefromTempToServer = require("../image/moveImageFromTempFolder");

let copyImageFromTempToServer = (req, res, next) => {
    let dstPath = `${config.upload.customImages}/`;
    console.log("dstPath", dstPath);
    console.log("req.body.images", req.body.images);
    moveImagefromTempToServer(req.body.images, dstPath, (err, results) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "something went wrong  ",
                err,
            });
        } else {
            return res
                .status(200)
                .json({ success: true, message: "Images moved successfully" });
        }
    });
};
module.exports = [copyImageFromTempToServer];
