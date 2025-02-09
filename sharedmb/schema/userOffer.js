let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let userOfferSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    offerId: { type: Schema.Types.ObjectId, ref: "offer", index: 1 },
    created: Number,
    updated: Number,
    date: Date,
    orderId: [],
    subscriptionId: [],
    useCount: { type: Number, default: 0 },
});

userOfferSchema.plugin(AutoIncrement, { inc_field: "id", id: "userOfferId" });
module.exports = mongoose.model("userOffer", userOfferSchema);
