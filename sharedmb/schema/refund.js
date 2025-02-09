let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let refundSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "productId", index: 1 },
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    amount: Number,
    type: { type: String, lowercase: true }, // orderRefund
    refundBy: { type: Schema.Types.ObjectId, ref: "admin" },
    message: { type: String, lowercase: true },
    orderId: { type: Schema.Types.ObjectId, ref: "order", index: 1 },
    transactionId: {
        type: Schema.Types.ObjectId,
        ref: "walletTransaction",
        index: 1,
    },
    created: { type: Date },
    updated: { type: Date },
    date: { type: Date },
});

refundSchema.plugin(AutoIncrement, { inc_field: "id", id: "refundId" });
module.exports = mongoose.model("refund", refundSchema);
