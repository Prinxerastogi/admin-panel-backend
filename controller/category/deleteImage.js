let category = require("../../sharedmb/schema/category");
let config = require("config");
let validate = require("express-validation");
let validation = require("./validation");
let findRemoveSync = require("find-remove");

let findCategoryAndRemoveImageFromDB = (req, res, next) => {
    req.data = {};
    category.findOneAndUpdate(
        { _id: req.body.categoryId },
        {
            $pull: {
                images: {
                    $regex: req.body.imageName,
                },
            },
        },
        (err, category) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in find category ",
                    err,
                });
            }
            if (category) {
                req.data.category = category;
                next();
            }
        }
    );
};

let removeImageFromServer = (req, res) => {
    let folderPath = `${config.upload.categoryImagePath}${req.data.category.id}/`;
    let imagePath = `${folderPath}${req.body.imageName}*`;
    console.log(imagePath);
    let result = findRemoveSync(folderPath, { prefix: req.body.imageName });
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

module.exports = [
    validate(validation.removeImage),
    findCategoryAndRemoveImageFromDB,
    removeImageFromServer,
];
