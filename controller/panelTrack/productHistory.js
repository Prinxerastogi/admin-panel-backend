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

    
    if (!mongoose.isValidObjectId(productId)) {
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
          let: { userId: "$userId", userType: "$userType" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$userType", "seller"] },
                    { $eq: ["$_id", "$$userId"] }
                  ]
                }
              }
            }
          ],
          as: "sellerInfo",
        },
      },
      {
        $lookup: {
          from: "admins",
          let: { userId: "$userId", userType: "$userType" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$userType", "admin"] },
                    { $eq: ["$_id", "$$userId"] }
                  ]
                }
              }
            }
          ],
          as: "adminInfo",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          message: 1,
          data: 1,
          userType: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            $cond: {
              if: { $eq: ["$userType", "seller"] },
              then: { $arrayElemAt: ["$sellerInfo.userId", 0] },
              else: null,
            },
          },
          email: {
            $cond: {
              if: { $eq: ["$userType", "admin"] },
              then: { $arrayElemAt: ["$adminInfo.email", 0] },
              else: null,
            },
          },
          logType: "$userType",
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
