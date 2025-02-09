let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let contactUsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    email: { type: String },
    phoneNo: { type: Number },
    name: { type: String },
    subject: { type: String },
    message: { type: String },
    created: Number,
    updated: Number,
    date: { type: Date },
});

module.exports = mongoose.model("contactUs", contactUsSchema);
