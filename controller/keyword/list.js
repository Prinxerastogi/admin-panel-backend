let crud = require("../../sharedmb/models/crud");
let keywordSchema = require("../../sharedmb/schema/searchKeyword");
let mongoose = require("mongoose");
let paginationController = require("../pagination/pagination");

let findKeywordList = (req, res) => {
    let pagination = {
        page: Number(req.query.start),
        limit: Number(req.query.limit),
    };
    let condition = [
        {
            $match: {
                cityId: mongoose.Types.ObjectId(req.query.cityId),
            },
        },
    ];

    if (pagination.page >= 0 && pagination.limit) {
        condition.push(paginationController.add);
    }

    // if (pagination.page >= 0 && pagination.limit) {
    //     condition.push(
    //         {
    //             $group: {
    //                 _id: null,
    //                 total: {
    //                     $sum: 1
    //                 },
    //                 blogs: {
    //                     $push: '$$ROOT'
    //                 }
    //             }
    //         },
    //         {
    //             $unwind: {
    //                 path: '$blogs'
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 'blogs.total': '$total'
    //             }
    //         },
    //         {
    //             $replaceRoot: {
    //                 newRoot: '$blogs'
    //             }
    //         },
    //         {
    //             $skip: (pagination.page) * (pagination.limit)
    //         },
    //         {
    //             $limit: pagination.limit
    //         }
    //     )
    // }

    crud.aggregation(condition, keywordSchema, (err, data) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in findKeywordList",
            });
        } else {
            return res
                .status(200)
                .json({ success: true, message: "data found", data });
        }
    });
};
module.exports = [findKeywordList];
