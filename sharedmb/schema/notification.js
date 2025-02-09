let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let notificationSchema = new Schema({
    title: { type: String, lowercase: true },
    shortDesc: { type: String, lowercase: true },
    longDesc: { type: String, lowercase: true },
    images: [],
    type: { type: String, lowercase: true },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    userId: {},
    created: Number,
    updated: Number,
    date: Date,
});

notificationSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "notificationId",
});
module.exports = mongoose.model("notification", notificationSchema);
