let productSchema = require("../../sharedmb/schema/product");
let crud = require("../../sharedmb/models/crud");
let async = require("async");
let config = require("config");
const fs = require("fs-extra");
let gm = require("gm").subClass({ imageMagick: true });
let createImageVariantController = require("../image/imageVariant");

let findAllProduct = () => {
    crud.find({}, productSchema, (err, products) => {
        if (err) {
            console.log("error in findProducts", err);
        } else if (products && products.length > 0) {
            checkProductImages(products);
        } else {
            console.log("no product found", err);
        }
    });
};

let checkProductImages = (products) => {
    async.eachOfSeries(
        products,
        (_, i, callback2) => {
            async.eachOf(
                _.images,
                (image, j, callback) => {
                    let imagePath = `${config.upload.productImagePath}${_._name}/${image}`;
                    // let folderName = _._name;
                    // let imagefile = image;
                    let dstPath = `${config.upload.productImagePath}${_._name}/`;

                    if (fs.existsSync(imagePath)) {
                        createImageVariantController(
                            dstPath,
                            image,
                            (err, result) => {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, result);
                                }
                            }
                        );
                    } else {
                        console.log("no image found");
                        callback({ error: "no image found" });
                    }
                },
                (err, result) => {
                    if (err) {
                        callback2(null, err);
                    } else {
                        callback2(null, result);
                    }
                }
            );
        },
        (err) => {
            if (err) {
                console.log("ERROR:" + err);
                //callback2({ err })
            } else {
                console.log("all done");
            }
        }
    );
};

let checkImageExitance = (path, folderName, image, callback) => {
    let imgaePath = `${path}${folderName}/${image}`;
    fs.access(imgaePath, (err, isExist) => {
        if (err) callback(err);
        callback(null, isExist);
    });
};

//findAllProduct();

// let checkImageExitance = (path, folderName, image, callback) => {
//     try {
//         let imgaePath = `${path}${folderName}/${image}`;
//         if (fs.existsSync(imgaePath)) {

//             callback(null, createImageVariant(path, folderName, image, (err, respnse) => {
//                 if (err) {
//                     console.log(err)
//                 }
//                 console.log('resp0nse: ' + respnse)
//             }))
//         }
//         else {
//             console.log('image does not exists on server')
//             // removeImage();
//         }
//     } catch (err) {
//         console.error(err)
//     }
// };
