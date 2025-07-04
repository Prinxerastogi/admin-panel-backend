let mongoose = require("mongoose");
let AutoIncrement = require("mongoose-sequence")(mongoose);

let grwUsers = mongoose.Schema({
    phoneNumber: { type: Number, default: null },
    totalPurchase: { type: Number, default: null },
    otp: { type: Number, default: null },
    requestOtpTime: { type: Date, default: null },
});

grwUsers.plugin(AutoIncrement, { inc_field: "id", id: "grwUserId" });

module.exports = mongoose.model("grwusers", grwUsers);
