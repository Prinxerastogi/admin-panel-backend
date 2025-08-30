const mongoose = require("mongoose");
const Admin = require("../../sharedmb/schema/admin");
const crud = require("../../sharedmb/models/crud");

module.exports = async (req, res) => {
  try {
    const { id, active } = req.body;

    if (!id || typeof active === "undefined") {
      return res.status(400).json({
        success: false,
        message: "User ID and active status are required",
      });
    }

    if (!new mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    crud.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: active,
          updated: Date.now(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
      Admin,
      (err, updatedUser) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({
            success: false,
            message: "Error updating user status",
          });
        }

        if (!updatedUser) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        return res.status(200).json({
          success: true,
          message: `User ${
            updatedUser.isActive ? "activated" : "deactivated"
          } successfully`,
          user: {
            _id: updatedUser._id,
            email: updatedUser.email,
            isActive: updatedUser.isActive,
          },
        });
      }
    );
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
