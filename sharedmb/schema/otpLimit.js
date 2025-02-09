let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let otpLimitSchema = Schema({
    otpLimit: Number,
    totalOtpSend: { type: Number, default: 0 },
    created: Number,
    updated: Number,
});

otpLimitSchema.plugin(AutoIncrement, { inc_field: "id", id: "otpLimitId" });

module.exports = mongoose.model("otpLimit", otpLimitSchema);
