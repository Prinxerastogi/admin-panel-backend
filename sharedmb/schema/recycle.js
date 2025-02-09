let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RecycleSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    qty: {
        expectedQty: Number,
        actualQty: Number,
    },
    weight: {
        expectedWeight: Number,
        actualWeight: Number,
    },
    price: {
        expectedPrice: Number,
        actualPrice: Number,
    },
    pickupSchedule: {
        date: String,
        time: String,
    },
    otp: Number,
    date: { type: Date },
});

module.exports = mongoose.model("recycle", RecycleSchema);
