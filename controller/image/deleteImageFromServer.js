let config = require("config");
const findRemoveSync = require("find-remove");

let removeImageFromServer = (req, res) => {
    if (!req.params?.filename) return;
    let folderPath = `${config.upload.customImages}`;
    let result = findRemoveSync(folderPath, { prefix: req.params?.filename });
    if (Object.keys(result).length > 0) {
        return res.status(200).json({
            success: true,
            message: "updated",
            response: req.body.categoryId,
        });
    } else {
        return res.status(201).json({
            success: true,
            message: "no image found",
            response: req.body.categoryId,
        });
    }
};
module.exports = [removeImageFromServer];
