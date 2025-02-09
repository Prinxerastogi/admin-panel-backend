let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let sellerTransactionSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: "seller", index: 1 },
    type: String,
    description: String,
    paymentMode: String,
    amount: Number,
    credited: Boolean,
    debited: Boolean,
    deliveries: [],
    created: Number,
    updated: Number,
    date: { type: Date },
    commission: Number,
    orderIds: [],
});

module.exports = mongoose.model("sellerTransaction", sellerTransactionSchema);
