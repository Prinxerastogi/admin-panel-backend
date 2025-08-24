const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
let panelTrack = require("../../sharedmb/schema/panelTack");
const productHistory = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!new mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format",
      });
    }

    const logs = await panelTrack.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $lookup: {
          from: "sellerusers",
          localField: "sellerId",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "adminId",
          foreignField: "_id",
          as: "adminInfo",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          message: 1,
          data: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            $cond: {
              if: { $gt: [{ $size: "$sellerInfo" }, 0] },
              then: { $arrayElemAt: ["$sellerInfo.userId", 0] },
              else: null,
            },
          },
          email: {
            $cond: {
              if: { $gt: [{ $size: "$adminInfo" }, 0] },
              then: { $arrayElemAt: ["$adminInfo.email", 0] },
              else: null,
            },
          },
          logType: {
            $cond: {
              if: { $gt: [{ $size: "$sellerInfo" }, 0] },
              then: "seller",
              else: {
                $cond: {
                  if: { $gt: [{ $size: "$adminInfo" }, 0] },
                  then: "admin",
                  else: "other",
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Logs fetched successfully",
      data: {
        productId: productId,
        totalLogs: logs.length,
        logs: logs,
      },
    });
  } catch (error) {
    console.error("Error fetching panel logs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = productHistory;
