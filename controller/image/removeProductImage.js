let crud = require("../../sharedmb/models/crud");
let product = require("../../sharedmb/schema/product");
let fs = require("fs-extra");
let config = require("config");
let validate = require("express-validation");
let validation = require("./validation");
let findRemoveSync = require("find-remove");

// db.getCollection('products').update({_id:ObjectId('5e34f1516c6cc41cd3eab6ae')},{

//     $pull:{

//         images:{
//             $regex:'1583213959625'

//             }
//         }})

let findProductAndRemoveImageFromDB = (req, res, next) => {
    req.data = {};
    crud.findOneAndUpdate(
        { _id: req.body.productId },
        {
            $pull: {
                images: {
                    $regex: req.body.imageName,
                },
            },
        },
        {},
        product,
        (err, product) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message:
                        "error occured in findProductAndRemoveImageFromDB ",
                    err,
                });
            }
            if (product) {
                req.data.product = product;
                next();
            }
        }
    );
};

let removeImageFromServer = (req, res) => {
    let product = req.data.product;
    let name = product._name;
    let folderPath = `${config.upload.productImagePath}${name}/`;
    let imagePath = `${folderPath}${req.body.imageName}*`;
    console.log(imagePath);
    // fs.remove(imagePath, (err, remove) => {
    //     if (err) {
    //         return res.status(400).json({ error: true, message: 'error occured in removeImageFromServer ', err });
    //     }
    //     else {
    //         return res.status(200).json({ success: true, message: 'updated', response: req.body.productId });
    //     }
    // })

    let result = findRemoveSync(folderPath, { prefix: req.body.imageName });
    if (Object.keys(result).length > 0) {
        return res.status(200).json({
            success: true,
            message: "updated",
            response: req.body.productId,
        });
    } else {
        return res.status(201).json({
            success: true,
            message: "no image found",
            response: req.body.productId,
        });
    }
};

module.exports = [
    validate(validation.removeImage),
    findProductAndRemoveImageFromDB,
    removeImageFromServer,
];
