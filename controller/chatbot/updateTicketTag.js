"use strict";
const crudModel = require("../../sharedmb/models/crud"),
  ticketSchema = require("../../sharedmb/schema/ticket"),
  configSchema = require("../../sharedmb/schema/config"),
  mongoose = require("mongoose");

// Helper function to get tag options from config
const getTagOptionsFromConfig = async () => {
  try {
    // Get config document with tags
    const config = await new Promise((resolve, reject) => {
      crudModel.findOne({}, configSchema, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Default tag options if no config exists or no chat_tags
    const defaultTags = ["Custom"];

    // Return chat_tags from config if they exist, otherwise return default tags
    return config && config.chat_tags && config.chat_tags.length > 0
      ? [...config.chat_tags, "Custom"]
      : defaultTags;
  } catch (error) {
    console.error("Error fetching tag options from config:", error);
    // Return default tags in case of error
    return ["Custom"];
  }
};

// Helper function to save a new custom tag to config
const saveCustomTagToConfig = async (customTag) => {
  try {
    const updateConfig = await configSchema.findOneAndUpdate(
      {},
      {
        $addToSet: { chat_tags: customTag },
      }
    );
    if (updateConfig) {
      console.log("Custom tag saved to config:", customTag);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving custom tag to config:", error);
    return false;
  }
};

const getTicketCondition = (ticketId) => {
  if (mongoose.isValidObjectId(ticketId)) {
    return { _id: new mongoose.Types.ObjectId(ticketId) };
  }
  return { id: ticketId };
};

// Get all tag options
exports.getTagOptions = async (req, res) => {
  try {
    // Get tag options dynamically from config
    const tagOptions = await getTagOptionsFromConfig();

    return res.status(200).json({
      success: true,
      tagOptions: tagOptions,
      message: "Tag options fetched successfully",
    });
  } catch (error) {
    console.error("Error in getTagOptions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get ticket with tag options
exports.getTicketWithTagOptions = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    const condition = getTicketCondition(ticketId);

    // Get tag options dynamically from config
    const tagOptions = await getTagOptionsFromConfig();

    // Get ticket data
    try {
      const ticket = await new Promise((resolve, reject) => {
        crudModel.findOne(condition, ticketSchema, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      // Return ticket with tag options for UI dropdown
      return res.status(200).json({
        success: true,
        ticket: ticket,
        tagOptions: tagOptions,
        message: "Ticket with tag options fetched successfully",
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Error fetching ticket",
        error: err.message || err,
      });
    }
  } catch (error) {
    console.error("Error in getTicketWithTagOptions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get tickets by tag
exports.getTicketsByTag = async (req, res) => {
  try {
    const condition = {
      ticketTag: req.query.tag,
    };

    // Get tickets matching the tag
    try {
      const tickets = await new Promise((resolve, reject) => {
        crudModel.find(condition, ticketSchema, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return res.status(200).json({
        success: true,
        tickets: tickets,
        message: "Tickets filtered by tag fetched successfully",
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Error fetching tickets by tag",
        error: err.message || err,
      });
    }
  } catch (error) {
    console.error("Error in getTicketsByTag:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update ticket tag
exports.updateTicketTag = async (req, res) => {
  try {
    console.log("Received request body:", req.body);

    const { ticketId, tagType, customTagText } = req.body;

    // Validate required fields
    if (!ticketId || !tagType) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID and tag type are required",
      });
    }

    // Get ticket condition
    const condition = getTicketCondition(ticketId);

    // First check if the ticket exists
    const ticketExists = await new Promise((resolve, reject) => {
      crudModel.findOne(condition, ticketSchema, (err, ticket) => {
        if (err) reject(err);
        else resolve(ticket);
      });
    });

    if (!ticketExists) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    console.log("Ticket found:", ticketExists);

    // Get current tag options
    const tagOptions = await getTagOptionsFromConfig();

    // Handle tag selection
    let selectedTag;

    if (tagOptions.includes(tagType) && tagType !== "Custom") {
      // For predefined tags
      selectedTag = tagType;
    } else if (tagType === "Custom" && customTagText) {
      // For custom tag option
      selectedTag = customTagText;

      // Save new custom tag to config
      await saveCustomTagToConfig(customTagText);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid tag type selection",
      });
    }

    console.log("Selected tag:", selectedTag);

    // Prepare update object
    const updateObject = { ticketTag: selectedTag };

    // Update ticket with selected tag
    try {
      const result = await ticketSchema.findOneAndUpdate(
        condition,
        { $set: updateObject },
        { new: true }
      );
      console.log("Update result:", result);

      console.log("Update completed, returning response");

      return res.status(200).json({
        success: true,
        message: "Ticket tag updated successfully",
        ticket: result,
      });
    } catch (err) {
      console.error("Error in database operation:", err);
      return res.status(400).json({
        success: false,
        message: "Error updating ticket tag",
        error: err.message || err,
      });
    }
  } catch (error) {
    console.error("Error in updateTicketTag:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
