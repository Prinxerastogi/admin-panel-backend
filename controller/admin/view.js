"use strict";
let schema = require("../../sharedmb/schema/admin"),
    crud = require("../../sharedmb/models/crud"),
    mongoose = require("mongoose"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    jwt = require("jsonwebtoken"),
    MESSAGE = require("./message");

module.exports = (req, res) => {
    crud.aggregation(
        [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.decoded.id),
                },
            },
            // {
            //     $lookup: {al
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
        (err, admin) => {
            if (err) {
                return res.status(400).json({
                    success: true,
                    messsage: "error occured in view admin",
                    err,
                });
            }
            if (admin) {
                return res.status(200).json({
                    success: true,
                    message: `user found`,
                    user: admin,
                });
            }
            return res
                .status(200)
                .json({ success: true, message: `user  not found` });
        }
    );
};
