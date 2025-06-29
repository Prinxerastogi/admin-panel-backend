const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");

const listProductGroups = async (req, res) => {
    const pagination = {
        page: Number(req.query.start) || 0,
        limit: Number(req.query.limit) || 10,
    };
const typeFilter = req.query.type;
    const matchCondition = typeFilter ? { type: typeFilter } : {};

    const condition = [
         { $match: matchCondition },
        {
            $sort: {
                id: 1,
            },
        },
        {
            $skip: pagination.page * pagination.limit,
        },
        {
            $limit: pagination.limit,
        },
        {
            $lookup: {
                from: "products",
                localField: "products",
                foreignField: "id",
                as: "productDetails",
            },
        },
    ];
    const totalPages = await productGroupSchema.countDocuments(matchCondition);
    crudModel.aggregation(condition, productGroupSchema, (err, groups) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "Error retrieving product groups",
                error: err.message,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Product groups retrieved successfully",
            data: groups,
            totalPages: Math.ceil(totalPages / pagination.limit),
        });
    });
};

module.exports = [listProductGroups];
