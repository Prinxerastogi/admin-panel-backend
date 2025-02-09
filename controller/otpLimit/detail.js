let otpLimitSchema = require("../../sharedmb/schema/otpLimit");

let otpLimitDetail = (req, res) => {
    otpLimitSchema.find({}, (err, response) => {
        if (err) {
            return res.status(400).json({ err: true, err: err.message });
        } else if (response.length > 0) {
            res.status(200).json({
                success: true,
                message: "otp limit detail sound",
                data: response[0],
            });
        } else {
            res.status(200).json({
                success: false,
                message: "otp limit not found",
            });
        }
    });
};

module.exports = [otpLimitDetail];
