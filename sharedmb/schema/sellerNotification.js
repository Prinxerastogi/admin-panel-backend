let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let sellerNotificationSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    event: { type: String, lowercase: true },
    link: String,
    description: { type: String, lowercase: true },
    isDeleted: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    created: Number,
    updated: Number,
    date: Date,
    data: {},
});

sellerNotificationSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "sellerNotificationId",
});
module.exports = mongoose.model("sellerNotification", sellerNotificationSchema);
