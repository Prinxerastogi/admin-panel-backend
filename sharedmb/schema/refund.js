const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const refundSchema = new Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        orderId: { type: Schema.Types.ObjectId, ref: "orders", index: 1 },
        amount: Number,
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        products: [{}],
        deliveryFee: { type: Boolean, default: false },
        deliveryFeeAmount: { type: Number, default: 0 },
        smallCartFee: { type: Boolean, default: false },
        smallCartFeeAmount: { type: Number, default: 0 },
        amountSplit: {},
    },
    {
        timestamps: true,
    }
);

refundSchema.plugin(AutoIncrement, { inc_field: "id", id: "refundId" });
module.exports = mongoose.model("refund", refundSchema);
