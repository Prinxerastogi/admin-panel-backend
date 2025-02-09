let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let sellerBankTransactionSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: "seller", index: 1 },
    // type: String,
    // description: String,
    paymentMode: String,
    amount: Number,
    credited: Boolean,
    debited: Boolean,
    //deliveries: [],
    creditAccountNumber: Number,
    debitAccountNumber: Number,
    HostReferenceNumber: Number,
    IfscCode: String,
    NetworkId: String,
    TotalAmount: String, //"INR|7381.0",
    amount: Number,
    currency: String,
    TransactionRemarks: String,
    TransactionStatus: String,
    TransactionStatusRemarks: String,
    TransactionType: String,
    created: Number,
    updated: Number,
    date: { type: Date },
});

module.exports = mongoose.model(
    "sellerBankTransaction",
    sellerBankTransactionSchema
);
