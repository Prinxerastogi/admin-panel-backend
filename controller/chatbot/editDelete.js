"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  ticketSchema = require("../../sharedmb/schema/ticket"),
  mongoose = require("mongoose");

const deleteChatMessage = async (req, res) => {
  crudModel.updateOne(
    { _id: new mongoose.Types.ObjectId(req.body.ticketId) },
    { $set: { "chats.$[elem].isDeleted": true } },
    {
      arrayFilters: [
        { "elem._id": new mongoose.Types.ObjectId(req.body.chatId) },
      ],
    },
    ticketSchema,
    (err) => {
      if (err) {
        return res
          .status(400)
          .json({ error: true, message: "Error deleting chat", error: err });
      } else {
        return res
          .status(200)
          .json({ error: false, success: true, message: "Chat deleted" });
      }
    }
  );
};

const editChatMessage = async (req, res) => {
  crudModel.updateOne(
    { _id: new mongoose.Types.ObjectId(req.body.ticketId) },
    {
      $set: {
        "chats.$[elem].message": req.body.newMessage,
        "chats.$[elem].isEdited": true,
      },
    },
    {
      arrayFilters: [
        { "elem._id": new mongoose.Types.ObjectId(req.body.chatId) },
      ],
    },
    ticketSchema,
    (err) => {
      if (err) {
        return res
          .status(400)
          .json({ error: true, message: "Error editing chat", error: err });
      } else {
        return res
          .status(200)
          .json({ error: false, success: true, message: "Chat edited" });
      }
    }
  );
};

module.exports = { deleteChatMessage, editChatMessage };
