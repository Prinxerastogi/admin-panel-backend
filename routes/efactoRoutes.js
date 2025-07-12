"use strict";
let express = require("express");
let efactoRoutes = express.Router();
let efactoUsers = require("../sharedmb/schema/efactoUsers"),
    utility = require("../sharedmb/utility/utility"),
    jwt = require("jsonwebtoken"),
    config = require("config");

efactoRoutes.get("/", async (req, res) => {
    return res.json({ success: true, message: "Welcome to GrowAasan Routes" });
});

efactoRoutes.post("/sendOtp", async (req, res) => {
    try {
        const phoneNumber = req.body.userId;
        const otp = utility.otpGenerate();

        await efactoUsers.findOneAndUpdate(
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

efactoRoutes.post("/verifyOtp", async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await efactoUsers.findOne({
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

efactoRoutes.use(function (req, res, next) {
    var token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (token) {
        jwt.verify(token, "helloWorldJwt", function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Err",
                    tokenAutorization: false,
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: "No Token Provided",
        });
    }
});
efactoRoutes.post("/getProfile", async (req, res) => {
    return res.json({
        success: true,
        profile: await efactoUsers.findById(req.decoded.id),
    });
});

module.exports = efactoRoutes;
