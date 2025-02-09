let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let sellerRoutesSchema = new Schema({
    id: { type: Number },
    name: { type: String },
    group: { type: String },
    distance: { type: Number, default: null },
    area: {
        type: { type: String, default: "Polygon" },
        coordinates: [],
    },
    priority: { type: Number, default: null },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    created: { type: Date },
    updated: { type: Date },
    date: { type: Date },
    sellerId: {
        type: mongoose.Types.ObjectId,
        default: null,
    },
});

sellerRoutesSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "sellerRoutesId",
});

module.exports = mongoose.model("sellerRoute", sellerRoutesSchema);
