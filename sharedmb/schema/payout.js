let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let payoutSchema = new Schema({
    proposedAmount: { type: Number, default: null },
    settledAmount: { type: Number, default: null },
    paymentRef: { type: String, default: null },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending" },
    poId: { type: Number },
    grnId: { type: Number },
    supplierId: { type: mongoose.Types.ObjectId },
    sellerId: { type: mongoose.Types.ObjectId },
    invoiceNumber: { type: String },
    paymentDate: { type: Date, default: null },
});

payoutSchema.plugin(AutoIncrement, { inc_field: "id", id: "payoutId" });
module.exports = mongoose.model("payout", payoutSchema);
