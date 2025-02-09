let crudModel = require("../../sharedmb/models/crud");
let brandSchema = require("../../sharedmb/schema/brand");
let validate = require("express-validation");
let validation = require("./validation");
let mongoose = require("mongoose");
let MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        let pagination = {
            page: Number(req.query.start),
            limit: Number(req.query.end),
        };
        let condition = [];
        condition.push(
            {
                $match: {
                    isRootBrand: true,
                },
            },
            {
                $sort: {
                    name: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: 1,
                    },
                    brands: {
                        $push: "$$ROOT",
                    },
                },
            },

            {
                $unwind: {
                    path: "$brands",
                },
            },
            {
                $addFields: {
                    "brands.total": "$total",
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$brands",
                },
            }
            // { $replaceRoot: { newRoot: { $mergeObjects: [{ dogs: 0, cats: 0, birds: 0, fish: 0 }, "$pets"] } } }
        );

        if (
            req.query.start != null &&
            req.query.end != null &&
            req.query.start.length > 0 &&
            req.query.end.length > 0
        ) {
            condition.push(
                {
                    $skip: pagination.page * pagination.limit,
                },
                {
                    $limit: pagination.limit,
                }
            );
        }
        crudModel.aggregation(condition, brandSchema, (err, brand) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.show.error,
                    error: err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: `${brand.length} brand found`,
                    brand: brand,
                });
            }
        });
    },
];
