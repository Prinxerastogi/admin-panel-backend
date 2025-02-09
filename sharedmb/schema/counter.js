const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let counterSchema = new Schema({
    id: { type: String },
    reference_value: { type: String },
    seq: { type: Number },
});

module.exports = mongoose.model("counter", counterSchema);
