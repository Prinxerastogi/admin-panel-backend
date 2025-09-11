let productSchema = require("../../sharedmb/schema/product");
let brandSchema = require("../../sharedmb/schema/brand");
const crudModel = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

let findProduct = (req, res, next) => {
    let condition = {
        $or: [{ "subBrand.id": req.params.id }, { "brand.id": req.params.id }],
    };
    crudModel.find(condition, brandSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "something went wrong",
                error: err,
                success: false,
            });
        } else if (response.length > 0) {
            return res.status(200).json({
                message: "brand is associated with products",
                success: false,
            });
        } else {
            next();
        }
    });
};

let findParentBrand = (req, res, next) => {
    let condition = {
        parentId: req.params.id,
    };
    crudModel.find(condition, brandSchema, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "something went wrong",
                error: err,
                success: false,
            });
        } else if (response.length > 0) {
            return res.status(200).json({
                message: "delete all sub brand first",
                success: false,
            });
        } else {
            next();
        }
    });
};

let pullBrandFromChildList = (req, res, next) => {
    let condition = {
        childIds: new mongoose.Types.ObjectId(req.params.id),
    };
    let update = {
        $pull: {
            childIds: new mongoose.Types.ObjectId(req.params.id),
        },
    };
    brandSchema.update(condition, update, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "something went wrong",
                error: err,
                success: false,
            });
        } else {
            next();
        }
    });
};

let removeBrand = (req, res) => {
    let condition = {
        _id: req.params.id,
    };
    brandSchema.deleteOne(condition, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "something went wrong",
                error: err,
                success: false,
            });
        } else if (response.deletedCount > 0) {
            return res
                .status(200)
                .json({ message: "brand deleted", success: true });
        } else {
            return res
                .status(200)
                .json({ message: "brand delete fail", success: true });
        }
    });
};

module.exports = [
    findProduct,
    findParentBrand,
    pullBrandFromChildList,
    removeBrand,
];
