let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let polygonSchema = new Schema(
    {
        id: { type: String, required: true }, // UUID or "default"
        colorCode: { type: String, default: "#000000" },
        coordinates: {
            type: [[Number]], // array of [lat, lng] pairs
            required: true,
        },
        basePrice: { type: Number, default: 0 },
        bonus: {
            active: { type: Boolean, default: false },
            amount: { type: Number, default: 0 },
        },
        createDate: { type: Date, default: Date.now },
        updateDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

polygonSchema.plugin(AutoIncrement, {
    inc_field: "numericId",
    id: "polygon_seq",
});

module.exports = mongoose.model("Polygon", polygonSchema);
