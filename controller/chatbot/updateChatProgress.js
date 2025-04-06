"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    ticketSchema = require("../../sharedmb/schema/ticket"),
    mongoose = require("mongoose");

const updateChatProgress = async (req, res, next) => {
    if (!req.body.ticketId || !req.body.chatProgress) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields: ticketId or chatProgress",
        });
    }

    let ticketId;
    try {
        ticketId = mongoose.Types.ObjectId(req.body.ticketId);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid ticket ID format",
        });
    }

    // Update the chat progress
    crudModel.findOneAndUpdate(
        { _id: ticketId },
        {
            $set: {
                chatProgress: req.body.chatProgress,
            },
        },
        {},
        ticketSchema,
        (err, ticket) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error occurred while updating chat progress",
                    error: err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "Chat progress updated successfully",
                    data: ticket,
                });
            }
        }
    );
};

module.exports = [updateChatProgress];
