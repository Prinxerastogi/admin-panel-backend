"use strict";
let categorySchema = require("../../sharedmb/schema/category"),
    crudModel = require("../../sharedmb/models/crud"),
    MESSAGE = require("./message");

module.exports = (req, res) => {
    let conditions = {
        isRoot: true,
        isDeleted: false,
        isActive: true,
    };
    let projections = {
        name: 1,
        isLeaf: 1,
        parentIds: 1,
        images: 1,
        id: 1,
        attributes: 1,
    };
    crudModel.findProjectionOptionAndSort(
        conditions,
        projections,
        {},
        categorySchema,
        (error, category) => {
            if (error) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: MESSAGE.rootcategory.error,
                    error,
                });
            } else if (category && category.length > 0) {
                return res.status(200).json({
                    error: false,
                    success: true,
                    message: `${category.length} category found`,
                    category,
                });
            } else {
                return res.status(201).json({
                    success: false,
                    message: MESSAGE.rootcategory.notfound,
                });
            }
        }
    );
};
