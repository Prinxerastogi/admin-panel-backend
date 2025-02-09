let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let returnOrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    productId: { type: Schema.Types.ObjectId, ref: "product" },
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

returnOrderSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "returnOrderId",
});
module.exports = mongoose.model("returnOrder", returnOrderSchema);
