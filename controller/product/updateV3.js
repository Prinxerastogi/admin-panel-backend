let productSchema = require("../../sharedmb/schema/product");
let sellerSchema = require("../../sharedmb/schema/sellerProduct");
let validate = require("express-validation");
let validation = require("./validation");
let updateProduct = (req, res) => {
    let product = req.body.product;
    let updateProductDetails = {
        description: product?.description ? product?.description : "",
        faq: product?.faq ? product?.faq : [],
        howToUse: product?.howToUse ? product?.howToUse : "",
        benefits: product?.benefits ? product?.benefits : "",
        nutritionalFacts: product?.nutritionalFacts
            ? product?.nutritionalFacts
            : [],
    };
    let condition = {
        _id: req.body.productId,
    };
    let update = {
        $set: updateProductDetails,
    };
    productSchema.findOneAndUpdate(condition, update, (err, updated) => {
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
                message: "updated successfully.",
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "already updated" });
        }
    });
};

module.exports = [validate(validation.updateProduct), updateProduct];
