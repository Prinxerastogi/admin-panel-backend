let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let serveAreaSchema = new Schema({
    servingAreas: [
        {
            area: { type: String },
            areaName: String,
            timeSlot: [
                {
                    slot: { type: String },
                    value: {
                        hr: { type: Number, default: 0 },
                        min: { type: Number, default: 0 },
                        minutes: { type: Number, default: 0 },
                    },
                    priority: { type: Number, default: null },
                    isDisabled: { type: Boolean, default: false },
                    isSelected: { type: Boolean, dafault: false },
                    orderCount: { type: Number, default: 0 },
                    created: Date,
                    updated: Date,
                },
            ],
            sellerId: {
                type: mongoose.Types.ObjectId,
                default: null,
            },
        },
    ],
    cityId: { type: mongoose.Types.ObjectId, index: 1 },
    created: Date,
    updated: Date,
});

module.exports = mongoose.model("servingArea", serveAreaSchema);
