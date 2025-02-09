let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let cashbackSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    amount: Number,
    type: { type: String, lowercase: true }, // referal/ admin
    addedType: { type: String, lowercase: true }, // referal/ admin
    addedBy: { type: Schema.Types.ObjectId, ref: "user" },
    message: { type: String, lowercase: true },
    region: { type: String, lowercase: true },
    orderId: { type: Schema.Types.ObjectId, ref: "order", index: 1 },
    transactionId: {
        type: Schema.Types.ObjectId,
        ref: "walletTransaction",
        index: 1,
    },
    created: Number,
    updated: Number,
    date: { type: Date },
});

cashbackSchema.plugin(AutoIncrement, { inc_field: "id", id: "cashbackId" });
module.exports = mongoose.model("cashback", cashbackSchema);
