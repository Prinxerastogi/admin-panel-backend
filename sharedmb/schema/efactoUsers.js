let mongoose = require("mongoose");
let efactoUsers = mongoose.Schema({
    phoneNo: { type: Number, default: null },
    totalPurchase: { type: Number, default: null },
    otp: { type: Number, default: null },
    requestOtpTime: { type: Date, default: null },
});

module.exports = mongoose.model("efactoUsers", efactoUsers);
