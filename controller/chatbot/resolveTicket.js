"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  ticketSchema = require("../../sharedmb/schema/ticket"),
  mongoose = require("mongoose");
const markResolved = async (req, res, next) => {
  crudModel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(req.body.ticketId) },
    {
      $set: {
        ticketStatus: "resolved",
        resolution: req.body?.message,
        isUnread: false,
        chatProgress: "closed",
        resolutionTime: new Date(),
      },
    },
    {},
    ticketSchema,
    (err, order) => {
      if (err) {
        return res.status(400).json({
          error: true,
          message: "error accured in findsellerProduct",
          error: err,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Ticket resolved successfully",
        });
      }
    }
  );
};

module.exports = [markResolved];
