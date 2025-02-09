let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
require("mongoose-double")(mongoose);

let subscriptionSchema = new Schema({
    id: { type: Number },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: "seller",
        default: "5cd130021829236505d77f62",
    },
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    address: {},
    subscription: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            quantity: Number,
            isActive: { type: Boolean, default: true },
        },
    ],
    morningBuy: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            quantity: Number,
        },
    ],
    created: { type: Number },
    updated: { type: Number },
});

subscriptionSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "subscriptionId",
});
module.exports = mongoose.model("subscription", subscriptionSchema);
