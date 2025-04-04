"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    ticketSchema = require("../../sharedmb/schema/ticket"),
    mongoose = require("mongoose");

const findTicket = async (req, res, next) => {
    req.data = {};
    crudModel.findOne(
        { _id: mongoose.Types.ObjectId(req.body.ticketId) },
        ticketSchema,
        (err, ticket) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error accured in findsellerProduct",
                    error: err,
                });
            } else {
                if (ticket?.ticketStatus === "open") next();
                else
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: "Ticket is closed",
                    });
            }
        }
    );
};
const pushMessage = async (req, res, next) => {
    crudModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body.ticketId) },
        {
            $push: {
                chats: {
                    source: "server",
                    message: req.body.message,
                },
            },
            $set: {
                isUnread: true,
                isConnected: true,
                chatProgress: "active",
            },
        },
        {},
        ticketSchema,
        (err, order) => {
            console.log("error2", err);
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error accured in findsellerProduct",
                    error: err,
                });
            } else next();
        }
    );
};
const returnUpdatedTicket = async (req, res) => {
    crudModel.findOne(
        { _id: mongoose.Types.ObjectId(req.body.ticketId) },
        ticketSchema,
        (err, ticket) => {
            if (err) {
                console.log("error");
                return res.status(400).json({
                    error: true,
                    message: "error accured in findsellerProduct",
                    error: err,
                });
            } else {
                return res.status(200).json({
                    error: false,
                    success: true,
                    message: "Ticket reverted",
                    ticket: ticket,
                });
            }
        }
    );
};
module.exports = [findTicket, pushMessage, returnUpdatedTicket];
