"use strict";
const AdminSchema = require("../../sharedmb/schema/admin"); 
const bcrypt = require('bcrypt');

const updatePassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
        return res.status(400).json({
            error: true,
            success: false,
            message: "All fields are required"
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            error: true,
            success: false,
            message: "Passwords do not match"
        });
    }

    try {
        const user = await AdminSchema.findOne({
            email: email,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        user.updated = Date.now();
        const updatedUser = await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
            user: {
                _id: updatedUser._id,
                email: updatedUser.email,
            }
        });

    } catch (error) {
        console.error("Password update error:", error);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = updatePassword;