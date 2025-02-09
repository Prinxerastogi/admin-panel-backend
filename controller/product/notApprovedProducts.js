let crudModel = require("../../sharedmb/models/crud"),
    productSchema = require("../../sharedmb/schema/product"),
    validate = require("express-validation"),
    validation = require("./validation");

let findNotApprovedProductList = (req, res) => {
    let condition = [
        [
            {
                $match: {
                    $or: [
                        {
                            "verification.isApproved": false,
                        },
                        { "verification.isImageVerify": false },
                        { "verification.isproductDetailVerify": false },
                    ],
                    $and: [{ status: "new" }, { isActive: false }],
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    includeArrayIndex: "index",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    categoryName: "$category.name",
                },
            },
            {
                $project: {
                    category: 0,
                },
            },
        ],
    ];
    crudModel.aggregation(condition, productSchema, (err, products) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "error accured in findNotApprovedProductList",
                error: err,
            });
        } else if (products && products.length > 0) {
            return res.status(200).json({
                success: true,
                message: `${products.length} product found`,
                products: products,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "no product found" });
        }
    });
};
module.exports = [findNotApprovedProductList];
