let productSchema = require("../../sharedmb/schema/product");
let mongoose = require("mongoose");

let childProducts = (req, res) => {
    let condition = [
        {
            $match: {
                isDeleted: false,
                parentId: mongoose.Types.ObjectId(req.params.parentProductId),
                isParent: false,
            },
        },
    ];

    productSchema.aggregate(condition, (err, response) => {
        if (err) {
            return res.status(400).json({ err: true, message: err.message });
        } else if (response.length > 0) {
            res.status(200).json({
                success: true,
                message: "products found",
                data: response,
            });
        } else {
            res.status(200).json({
                success: false,
                message: "no products found",
            });
        }
    });
};

module.exports = [childProducts];
