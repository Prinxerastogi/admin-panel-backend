"use strict";
let crudModel = require("../../sharedmb/models/crud"), // get our mongoose model
    notificationSchema = require("../../sharedmb/schema/notification"),
    MESSAGE = require("./message");

module.exports = [
    (req, res) => {
        let condition = [
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $sort: {
                    created: -1,
                },
            },
        ];
        crudModel.aggregation(
            condition,
            notificationSchema,
            (err, response) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: MESSAGE.get.error,
                        error: err,
                    });
                } else if (response == null) {
                    return res.status(201).json({
                        success: false,
                        message: MESSAGE.get.notfound,
                    });
                } else if (response && response.length > 0) {
                    return res.status(200).json({
                        success: true,
                        message: `${response.length} notification found`,
                        notification: response,
                    });
                } else {
                    return res.status(201).json({
                        success: false,
                        message: MESSAGE.get.notfound,
                    });
                }
            }
        );
    },
];
