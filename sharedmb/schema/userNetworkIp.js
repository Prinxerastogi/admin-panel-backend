let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let ipSchema = Schema({
    networkIp: String,
    reqOtpAttempts: { type: Number, default: 0 },
    created: Number,
    updated: Number,
});

ipSchema.plugin(AutoIncrement, { inc_field: "id", id: "userNetowrkIpId" });

module.exports = mongoose.model("userNetworkIp", ipSchema);
