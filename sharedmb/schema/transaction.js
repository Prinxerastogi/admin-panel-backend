let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    orderId: { type: Schema.Types.ObjectId, ref: "order", index: 1 },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    razorpayPaymentId: String,
    transactionId: String,
    status: String,
    updatedBalance: Number,
    oldBalance: Number,
    type: String,
    description: String,
    paymentMode: String,
    amount: Number,
    credited: Boolean,
    debited: Boolean,
    created: Number,
    updated: Number,
    date: { type: Date },
    mobileNo: Number,
    subcriptionIds: [],
    walletTransaferAmount: Number,
    razorpayPayTransferAmount: Number,
    paytm: {
        refId: String,
        orderId: String,
        mid: String,
        resultStatus: String,
        refundId: String,
        refundAmount: String,
        txnTimestamp: String,
        TXNID: String,
    },
});

transactionSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "transactionId",
});
module.exports = mongoose.model("transaction", transactionSchema);
