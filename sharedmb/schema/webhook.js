let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const webhookSchema = new Schema({
    data: {},
});

module.exports = mongoose.model("webhook", webhookSchema);
