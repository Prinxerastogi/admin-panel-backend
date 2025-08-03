let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const webhookSchema = new Schema({
    data: {},
    status: { type: String, enum: ["new", "begin", "err", "end"] },
});

module.exports = mongoose.model("webhook", webhookSchema);
