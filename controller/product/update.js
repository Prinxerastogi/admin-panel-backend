let crudModel = require("../../sharedmb/models/crud");
let productSchema = require("../../sharedmb/schema/product");
let mongoose = require("mongoose");
let validate = require("express-validation");
let validation = require("./validation");
let utility = require("../../sharedmb/utility/utility");
let fs = require("fs-extra");
let config = require("config");

let findProduct = (req, res, next) => {
    let query = [];
    let condition = { urlKey: req.body.urlKey };
    if (req.body.name) {
        query.push({ name: req.body.name.toLowerCase() });
    }
    if (req.body.urlKey) {
        query.push({ urlKey: req.body.urlKey });
    }

    if (req.body.barCode) {
        query.push({ barCode: req.body.barCode });
    }
    if (query.length > 0) {
        condition = {
            $or: query,
        };
    }

    crudModel.findOne(condition, productSchema, (err, product) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in findProduct",
                err,
            });
        }
        if (!product || product == null) {
            next();
        } else {
            if (req.body.name) {
                if (product.name == req.body.name.toLowerCase()) {
                    return res.status(201).json({
                        success: false,
                        message: `${product.name} already added with the name `,
                    });
                }
            } else if (req.body.urlKey) {
                if (product.urlKey == req.body.urlKey) {
                    return res.status(201).json({
                        success: false,
                        message: `${product.name} already added with the urlKey `,
                    });
                }
            } else {
                return res.status(201).json({
                    success: false,
                    message: `${product.name} already added with the barcode `,
                });
            }
        }
    });
};

let update = (req, res, next) => {
    req.data = {};
    if (!req.body.productId) {
        return res
            .status(400)
            .json({ success: false, message: "send the productId In Body" });
    }
    if (req.body.gpId && req.body.gpId.length > 0) {
        req.body.gpId = Number(req.body.gpId);
    }
    if (req.body.gmId && req.body.gmId.length > 0) {
        req.body.gmId = Number(req.body.gmId);
    }
    if (req.body.purchasePrice) {
        req.body.purchasePrice = Number(req.body.purchasePrice);
    }
    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase();
        req.body._name = utility.removeSpecialCharAndDash(req.body.name);
        req.data.folderName = req.body._name;
        req.data.isFolderName = true;
    }

    req.body.updated = new Date().getTime();
    // delete  req.body.name;
    let condition = { _id: req.body.productId };

    let update = {
        $set: req.body,
    };
    let option = {};
    crudModel.findOneAndUpdate(
        condition,
        update,
        option,
        productSchema,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error accured in hold product",
                    success: false,
                    error: err,
                });
            } else if (updated) {
                res.status(200).json({
                    success: true,
                    message: "updated successfully",
                });
                req.data.updated = updated;
                next();
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: "already updated" });
            }
        }
    );
};

let updateFolderName = (req, res) => {
    if (req.data.isFolderName && req.data.folderName) {
        fs.rename(
            `${config.upload.productImagePath}${req.data.updated._name}`,
            `${config.upload.productImagePath}${req.data.folderName}`,
            (err, folderUpdate) => {
                if (err) {
                    console.log(
                        "something went wrong in updateFolderName" + err
                    );
                    //  return res.status(400).json({ success: false, message: 'something went wrong in updateFolderName', err })
                } else {
                    return 1;
                }
            }
        );
    } else {
        return 1;
    }
};
module.exports = [
    validate(validation.productId),
    findProduct,
    update,
    updateFolderName,
];
