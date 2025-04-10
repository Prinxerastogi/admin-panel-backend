"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    ticketSchema = require("../../sharedmb/schema/ticket"),
    mongoose = require("mongoose");

const findTicket = async (req, res, next) => {
    console.log("findTicket", req.query);
    let condition = {};
    if (mongoose.isValidObjectId(req.query.ticketId)) {
        condition._id = mongoose.Types.ObjectId(req.query.ticketId);
    } else {
        condition.id = req.query.ticketId;
    }
    crudModel.findOne(condition, ticketSchema, (err, order) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error accured in findsellerProduct",
                error: err,
            });
        } else if (order)
            return res.status(200).json({
                success: true,
                tickets: order,
                message: "Ticket found ",
            });
        else
            return res.status(201).json({
                success: false,
                message: "Ticket not found",
            });
    });
};


module.exports = findTicket