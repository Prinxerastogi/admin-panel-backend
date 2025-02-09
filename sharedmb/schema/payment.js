let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let paymentSchema = new Schema({
    amount: Number,
    currency: { type: String, default: "INR" },
    cancelStatus: false,
    //order_id: String,
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "subscription",
        index: 1,
    },
    created: { type: Boolean, default: new Date().setTime() },
    updated: { type: Boolean, default: new Date().setTime() },
    progress: String, // success/pending/failed
    razorPaySigId: String,
    razorPayPaymentId: String,
    razorPayOrderId: String,
    date: { type: Date },
});

paymentSchema.plugin(AutoIncrement, { inc_field: "id", id: "paymentId" });
module.exports = mongoose.model("payment", paymentSchema);
