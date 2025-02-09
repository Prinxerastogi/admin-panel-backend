let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let referalTransactionSchema = new Schema({
    referralUserId: { type: Schema.Types.ObjectId, ref: "user" },
    orderId: { type: Schema.Types.ObjectId, ref: "orer" },
    orderUserId: { type: Schema.Types.ObjectId, ref: "user" },
    amount: Number,
    cityId: { type: Schema.Types.ObjectId, ref: "city" },
    created: Number,
    updated: Number,
    date: Date,
});

referalTransactionSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "referralTransactionId",
});
module.exports = mongoose.model(
    "referralTransaction",
    referalTransactionSchema
);
