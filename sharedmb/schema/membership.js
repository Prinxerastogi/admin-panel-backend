let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let membershipSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    month: Number,
    price: Number,
    date: String,
    isActive: { type: Boolean, default: false },
    images: [],
    description: { type: String, lowercase: true },
    created: Number,
    updated: Number,
    name: { type: String, lowercase: true },
});

membershipSchema.plugin(AutoIncrement, { inc_field: "id", id: "membershipId" });
module.exports = mongoose.model("membership", membershipSchema);
