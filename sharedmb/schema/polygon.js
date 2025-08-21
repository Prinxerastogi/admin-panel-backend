let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let polygonSchema = new Schema(
    {
        id: { type: String, required: true },
        colorCode: { type: String, default: "#000000" },
        geometry: {
            type: {
                type: String,
                enum: ["Polygon"],
                required: true,
                default: "Polygon",
            },
            coordinates: {
                type: [[[Number]]],
                required: true,
            },
        },
        config: {},
        variant: { type: String },
        createDate: { type: Date, default: Date.now },
        updateDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

polygonSchema.index({ geometry: "2dsphere" });

polygonSchema.plugin(AutoIncrement, {
    inc_field: "numericId",
    id: "polygon_seq",
});

module.exports = mongoose.model("Polygon", polygonSchema);
