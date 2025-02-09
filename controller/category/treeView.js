// 'use strict'
// let crudModel = require('../../sharedmb/models/crud'), // get our mongoose model
//  categorySchema = require('../../sharedmb/schema/category'),
//   fs = require("fs"),
//   MESSAGE = require('./message');

// function unflatten(arr) {
//     var tree = [],
//         mappedArr = {},
//         arrElem,
//         mappedElem;

//     // First map the nodes of the array to an object -> create a hash table.
//     for (var i = 0, len = arr.length; i < len; i++) {
//         arrElem = arr[i];
//         mappedArr[arrElem.id] = arrElem;
//         mappedArr[arrElem.id]['children'] = [];
//     }

//     for (var id in mappedArr) {
//         if (mappedArr.hasOwnProperty(id)) {
//             mappedElem = mappedArr[id];
//             // If the element is not at the root level, add it to its parent array of children.
//             if (mappedElem.parentIntId) {
//                 mappedArr[mappedElem['parentIntId']]['children'].push(mappedElem);
//             }
//             // If the element is at the root level, add it to first level elements array.
//             else {
//                 tree.push(mappedElem);
//             }
//         }
//     }
//     return tree;
// };

// let getCategoryList = (req, res, next) => {
//     let conditions = { isActive: true, isDeleted: false, }
//     let projections = {
//         id: 1,
//         name: 1,
//         parentIntId: 1,
//         attributes: 1,
//         parentIds: 1,
//         childIds: 1,
//         isLeaf: 1,
//         images: 1,
//     }
//     let options = {}
//     crudModel.findProjectionOptionAndSort(conditions, projections, options, categorySchema, (error, response) => {
//         if (error) return res.status(400).json({ message: MESSAGE.tree.mongoerror, error: error, success: false })
//         else if (response.length > 0) {
//             req.data = {}
//             req.data.response = JSON.parse(JSON.stringify(response))
//             next()
//         }
//         else return res.status(201).json({ message: MESSAGE.tree.error, message: MESSAGE.tree.unknown })
//     })
// };

// let makeTree = (req, res) => {
//     var tree = unflatten(req.data.response);
//     if (tree == undefined) return res.status(400).json({ message:  MESSAGE.tree.make})
//     else return res.status(200).json({ message: MESSAGE.tree.treeview, success: true, tree })
// };

// module.exports = [
//     getCategoryList,
//     makeTree
// ]

"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    categorySchema = require("../../sharedmb/schema/category"),
    MESSAGE = require("./message"),
    mongoose = require("mongoose");

let findHomeCategory = (req, res) => {
    let condition = [
        {
            $match: {
                $and: [
                    { isRoot: true },
                    { isDeleted: false },
                    // { isActive: true }
                ],
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "childIds",
                foreignField: "_id",
                as: "children",
            },
        },
        // {
        //     $lookup: {
        //         from: 'categories',
        //         localField: 'children.childIds',
        //         foreignField: '_id',
        //         as: 'children2'
        //     }
        // },
        // {
        //     $addFields: {
        //         'children.children': '$children2'

        //     }
        // },
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

module.exports = [findHomeCategory];
