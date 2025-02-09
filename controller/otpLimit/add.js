let otpLimitSchema = require("../../sharedmb/schema/otpLimit");

let addOtpLimit = (req, res) => {
    let payload = {
        created: Date.now(),
        updated: Date.now(),
        otpLimit: req.body.otpLimit,
    };

    otpLimitSchema.create(payload, (err, response) => {
        if (err) {
            return res.status(400).json({ err: true, message: err.message });
        } else if (response) {
            res.status(200).json({
                success: true,
                message: "otp limit created successfully",
            });
        } else {
            res.status(200).json({
                success: false,
                message: "unable to create otp limit",
            });
        }
    });
};

module.exports = [addOtpLimit];
