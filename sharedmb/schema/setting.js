let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let settingSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    deliveryCharges: Number,
    minimumOrderValue: Number,
    referralOffer: {},
    created: Number,
    updated: Number,
    date: { type: Date },
    areaId: mongoose.Types.ObjectId,
});

settingSchema.plugin(AutoIncrement, { inc_field: "id", id: "settingId" });

module.exports = mongoose.model("setting", settingSchema);
