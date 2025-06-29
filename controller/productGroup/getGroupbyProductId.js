const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");
const mongoose = require("mongoose");
const validate = require("express-validation");
const validation = require("./validation");

const getGroupbyProductId = (req, res) => {
    const productid = Number(req.params.productid);
    const groupType = req.query.type;

    const condition = [
        {
            $match: {
                products: { $in: [productid] },
                ...(groupType && { type: groupType }) 
            }
        },
        {
            $unwind: {
                path: "$products"
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "products",
                foreignField: "id",
                as: "result"
            }
        },
        {
            $unwind: {
                path: "$result"
            }
        },
        {
            $group: {
                _id: "$_id",
                products: {
                    $push: "$result"
                },
                groupId: {
                    $first: "$id"
                }
            }
        }
    ];

    crudModel.aggregation(condition, productGroupSchema, (err, group) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Error retrieving product group",
                error: err.message,
            });
        }
        if (!group || group.length === 0) {
            return res.status(404).json({
                success: false,
                message: groupType 
                    ? `No matching product group found of type '${groupType}'`
                    : "Product group not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Product group retrieved successfully",
            data: group[0], 
        });
    });
};

module.exports = [getGroupbyProductId];