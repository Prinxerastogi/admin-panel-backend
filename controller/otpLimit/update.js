let otpLimitSchema = require("../../sharedmb/schema/otpLimit");

let updateOtpLimit = (req, res) => {
  let payload = {
    updated: Date.now(),
    otpLimit: req.body.otpLimit,
  };

  otpLimitSchema.updateMany({}, payload, (err, response) => {
    if (err) {
      return res.status(400).json({ err: true, message: err.message });
    } else if (response.modifiedCount > 0) {
      res.status(200).json({
        success: true,
        message: "otp limit updated successfully",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "otp limit already updated",
      });
    }
  });
};

module.exports = [updateOtpLimit];
