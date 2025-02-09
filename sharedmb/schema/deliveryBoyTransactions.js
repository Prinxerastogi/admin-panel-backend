let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let deliveryBoyTransactionSchema = new Schema({
    deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "deliveryboy" },
    id: { type: Number, unique: true },
    created: Date,
    updated: Date,
    amount: { type: Number },
    type: { type: String },
    openingBalance: { type: Number },
    closingBalance: { type: Number },
    remarks: String,
    jobId: { type: Schema.Types.ObjectId },
    routeId: { type: Schema.Types.ObjectId },
});

deliveryBoyTransactionSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "DtransactionId",
});
module.exports = mongoose.model(
    "deliveryBoyTransaction",
    deliveryBoyTransactionSchema
);
