"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    categorySchema = require("../../sharedmb/schema/category"),
    MESSAGE = require("./message"),
    mongoose = require("mongoose");

let categoryHirarichy = (req, res) => {
    let condition = [
        {
            $match: {
                isRoot: true,
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: "categories",
                let: { id: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$parentId", "$$id"],
                            },
                            parentId: { $ne: null },
                            isDeleted: false,
                        },
                    },
                ],
                as: "children",
            },
        },
        {
            $unwind: {
                path: "$children",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                children: {
                    $ifNull: ["$children", {}],
                },
            },
        },
        {
            $lookup: {
                from: "categories",
                let: { id: "$children._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$parentId", "$$id"],
                            },
                            parentId: { $ne: null },
                            isDeleted: false,
                        },
                    },
                ],
                as: "children.children",
            },
        },
        {
            $sort: {
                "children.priority": 1,
            },
        },
        {
            $group: {
                _id: "$_id",
                rootCategory: {
                    $first: "$$ROOT",
                },
                children: {
                    $push: "$children",
                },
            },
        },
        {
            $addFields: {
                "rootCategory.children": "$children",
            },
        },
        {
            $replaceRoot: {
                newRoot: "$rootCategory",
            },
        },
        {
            $sort: {
                id: 1,
            },
        },
    ];

    crudModel.aggregation(condition, categorySchema, (err, category) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "error accured in findHomeCategory",
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "category found",
                category: category,
            });
        }
    });
};

module.exports = [categoryHirarichy];
