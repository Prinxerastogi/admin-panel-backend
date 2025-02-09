let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let voucherCodeSchema = new Schema({
    pCode: { type: String, required: true, unique: true, index: 1 },
    sCode: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    //isPercent: { type: Boolean, required: true, default: true },
    amount: { type: Number, required: true }, // if is percent, then number must be ≤ 100, else it’s amount of discount
    expireDate: { type: Date, required: true, default: "" },
    isActive: { type: Boolean, required: true, default: true },
    isRedeem: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "admin" },
    redeemBy: { type: Schema.Types.ObjectId, ref: "user" },
    transationId: { type: Schema.Types.ObjectId, ref: "walletTransaction" },
    cashRequestId: { type: Schema.Types.ObjectId, ref: "cashRequest" },
    created: Number,
    updated: Number,
    date: Date,
});

voucherCodeSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "voucherCodeId",
});
module.exports = mongoose.model("vouchercode", voucherCodeSchema);
