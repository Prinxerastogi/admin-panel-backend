"use strict";
let crudModel = require("../../sharedmb/models/crud"),
    ticketSchema = require("../../sharedmb/schema/ticket"),
    mongoose = require("mongoose");
const order = require("../../sharedmb/schema/order");

module.exports = (req, res) => {
    let currentUser = req.decoded;
    let userId = currentUser.id;
    let condition = [
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId),
                ticketStatus: { $ne: "closed" },
            },
        },
        {
            $project: {
                ticketStatus: 1,
                id: 1,
                date: { createdAt: 1 },
            },
        },
    ];
    if (req.query.page && req.query.limit) {
        let pagination = {
            page: Number(req.query.page),
            limit: Number(req.query.limit),
        };
        let paginate = [
            {
                $skip: pagination.page * pagination.limit,
            },
            {
                $limit: pagination.limit,
            },
        ];
        condition = [...condition, ...paginate];
    }
    crudModel.aggregation(condition, ticketSchema, (err, ticket) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: true,
                message: "error occured in find ticketList",
                error: err,
            });
        }
        console.log("Ticket", ticket);
        if (ticket && ticket.length > 0) {
            return res.status(200).json({
                success: true,
                message: ` ${ticket.length} tickets found`,
                tickets: ticket,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "Ticket not found" });
        }
    });
};
