"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  ticketSchema = require("../../sharedmb/schema/ticket"),
  mongoose = require("mongoose");

const updateTicketNote = async (req, res, next) => {
  if (!req.body.ticketId || req.body.note === undefined) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: ticketId or note",
    });
  }

  let ticketId;
  try {
    ticketId = new mongoose.Types.ObjectId(req.body.ticketId);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid ticket ID format",
    });
  }

  crudModel.findOneAndUpdate(
    { _id: ticketId },
    {
      $set: {
        note: req.body.note,
      },
    },
    {},
    ticketSchema,
    (err, ticket) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Error occurred while updating ticket note",
          error: err,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Ticket note updated successfully",
          data: ticket,
        });
      }
    }
  );
};

module.exports = [updateTicketNote];
