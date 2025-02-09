let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let walletTransactionSchema = new Schema({
    id: { type: Number },
    orderId: { type: Schema.Types.ObjectId, ref: "orderId" },
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    txnid: String,
    tempOrderId: { type: Schema.Types.ObjectId },
    transactionId: String,
    status: String, //created authorized,captured,refunded,failed
    updatedBalance: Number,
    oldBalance: Number,
    type: String,
    description: String,
    paymentMode: String,
    amount: Number,
    credited: Boolean,
    debited: Boolean,
    created: Number,
    expiryTime: Date,
    updated: Number,
    date: { type: Date },
    mobileNo: Number,
    paytm: {
        refId: String,
        orderId: String,
        mid: String,
        resultStatus: String,
        refundId: String,
        refundAmount: String,
        txnTimestamp: String,
        checksumHash: String,
    },
    razorpay: {
        paymentId: String,
        order_id: String,
    },
    payload: {},
    message: { type: String, lowercase: true },
    cronFetchCount: { type: Number },
    rechargeDetail: {},
    campaignId: { type: Schema.Types.ObjectId, ref: "campaign" },
});

walletTransactionSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "walletTransactionId",
});
module.exports = mongoose.model("walletTransaction", walletTransactionSchema);
