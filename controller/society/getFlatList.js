let crudModel = require("../../sharedmb/models/crud");
let societySchema = require("../../sharedmb/schema/society");
let mongoose = require("mongoose");
let validate = require("express-validation");
let validation = require("./validation");

module.exports = [
    validate(validation.getFlatList),
    (req, res) => {
        let aggregation = [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.query.societyId),
                },
            },
            {
                $unwind: {
                    path: "$flat",
                },
            },
            {
                $project: {
                    flat: 1,
                },
            },
            {
                $match: {
                    "flat.blockName": req.query.blockName.toLowerCase(),
                },
            },
        ];

        crudModel.aggregation(aggregation, societySchema, (error, response) => {
            if (error)
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error accured in finding society data",
                    error: error,
                });
            else if (response)
                return res.status(200).json({
                    message: "block found",
                    success: true,
                    response: response[0],
                });
            else
                return res
                    .status(201)
                    .json({ success: false, message: "no block found" });
        });
    },
];
