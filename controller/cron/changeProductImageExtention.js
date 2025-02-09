let productSchema = require("../../sharedmb/schema/product");
let crud = require("../../sharedmb/models/crud");
let async = require("async");
let config = require("config");
const fs = require("fs-extra");

let findAllProduct = () => {
    crud.find({}, productSchema, (err, products) => {
        if (err) {
            console.log("error in findProducts", err);
        } else if (products && products.length > 0) {
            checkProductImages(products);
        } else {
            console.log("no product found:" + _._id);
        }
    });
};

let checkProductImages = (products) => {
    async.eachOf(
        products,
        (_, i, callback) => {
            let images = [];
            let imageName;
            if (_.images && _.images.length > 0) {
                _.images.map((__, j) => {
                    imageName = __.split(".").slice(0, -1).join(".");
                    images.push(`${imageName}.png`);
                });

                crud.updateOne(
                    { _id: _._id },
                    {
                        $set: {
                            images: images,
                        },
                    },
                    {},
                    productSchema,
                    (err, updated) => {
                        if (err) {
                            callback({
                                error: true,
                                success: false,
                                message: "error occured in upadate image",
                            });
                        } else {
                            callback(null, updated);
                        }
                    }
                );
            } else {
                console.log("NO IMAGE FOUND");
            }
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

//findAllProduct();
