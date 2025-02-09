"use strict";
let schema = require("../../sharedmb/schema/admin"),
    crud = require("../../sharedmb/models/crud"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    jwt = require("jsonwebtoken"),
    MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        crud.aggregation(
            [
                {
                    $match: {
                        isDeleted: false,
                    },
                },
                // {
                //     $lookup: {
                //         from: "adminroles",
                //         localField: "roleId",
                //         foreignField: "_id",
                //         as: "role",
                //     },
                // },
                // {
                //     $unwind: {
                //         path: "$role",
                //     },
                // },
            ],
            schema,
            (err, list) => {
                if (err)
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: "error occured in get admins",
                        err,
                    });
                if (list && list.length > 0) {
                    return res.status(200).json({
                        success: true,
                        message: `${list.length} user found`,
                        users: list,
                    });
                } else
                    return res
                        .status(201)
                        .json({ success: false, message: `no user found` });
            }
        );
    },
];
