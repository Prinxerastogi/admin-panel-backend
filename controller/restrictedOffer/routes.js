"use strict";
let express = require("express");
let utility = require("../../sharedmb/utility/utility"),
    jwt = require("jsonwebtoken"),
    config = require("config");
const users = require("../../sharedmb/schema/user");
const requireDirectory = require("require-directory");
const currFolder = requireDirectory(module, "./");
let apiRoutes = express.Router();
apiRoutes.get("/", async (req, res) => {
    return res.json({ success: true, message: "Welcome to GrowAasan Routes" });
});
apiRoutes.get("/user/:userId", currFolder.getByUser);
apiRoutes.post("/add-users/:offerId", currFolder.addUsersToOffer);
apiRoutes.post("/redeem/:userId/:offerId/:mode", currFolder.redeemCoupon);
apiRoutes.delete("/remove/:userId/:offerId", currFolder.removeUserFromOffer);
apiRoutes.post("/sendOtp", async (req, res) => {
    try {
        const phoneNumber = req.body.userId;
        const otp = utility.otpGenerate();

        await users.findOneAndUpdate(
            { phoneNo: phoneNumber },
            { $set: { otp, requestOtpTime: new Date() } },
            { upsert: true, new: true }
        );

        const payload = {
            phoneNo: phoneNumber,
            otp,
            body: `<%23> Your LOGIN OTP for AAPKABAZAR is ${otp} Y3QVhKLNCC1`,
            template_id: `1707172147982617567`,
        };

        utility.otpSendWowAll(payload, (err, otpsend) => {
            if (err) {
                console.error("OTP Send Error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to send OTP",
                });
            }

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
            });
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});
apiRoutes.post("/verifyOtp", async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await users.findOne({
            phoneNo: userId,
            otp: otp,
            requestOtpTime: { $gt: new Date(Date.now() - 5 * 60 * 1000) },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired OTP.",
            });
        }

        const payload = {
            id: user._id,
            email: user.email,
            phoneNo: user.phoneNo,
        };

        const token = jwt.sign(payload, "helloWorldJwt");
        await user.save();

        const userdata = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo,
        };

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            token,
            user: userdata,
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

module.exports = apiRoutes;
