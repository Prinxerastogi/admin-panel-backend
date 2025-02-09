"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  moment = require("moment"),
  orderSchema = require("../../sharedmb/schema/order"),
  userSchema = require("../../sharedmb/schema/user"),
  ticketSchema = require("../../sharedmb/schema/ticket"),
  mongoose = require("mongoose");
const ticketFunctions = require("./ticketFunctions");

const findUser = async (req, res, next) => {
  req.data = {};
  crudModel.findOne(
    { phoneNo: Number(req.body.phoneNo) },
    userSchema,
    (err, data) => {
      if (err || !data) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      } else {
        req.data.user = data;
        next();
      }
    }
  );
};
const createTicket = async (req, res) => {
  let ticket = new ticketSchema({
    userId: req.data.user._id,
    chats: ticketFunctions.restartBot().chat,
    isUnread: true,
  });
  crudModel.create(ticket, ticketSchema, (err, data) => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ success: false, message: "Internal Server Error" });
    } else {
      console.log(data);
      return res.status(200).json({
        success: true,
        ticket: data,
        message: "Ticket created successfully",
      });
    }
  });
};

module.exports = [findUser, createTicket];
