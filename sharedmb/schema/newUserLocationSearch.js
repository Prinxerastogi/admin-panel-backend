let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let userLocationSchema = new Schema({
    area: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    formatted_address: { type: String },
    location: {},
    pincode: { type: String },
    updated: Number,
    created: Number,
    ip: String,
    date: { type: Date },
});

module.exports = mongoose.model("newUserLocation", userLocationSchema);
