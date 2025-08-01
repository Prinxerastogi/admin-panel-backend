const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restrictedOfferSchema = new Schema(
    {
        phoneNo: { type: Number, required: true },
        offerId: { type: Schema.Types.ObjectId, ref: "offer", required: true },
        redeemedAt: { type: String, enum: ["online", "offline"] },
        redeemedOn: { type: Date },
        status: {
            type: String,
            enum: ["active", "redeemed", "expired"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

restrictedOfferSchema.index({ phoneNo: 1, offerId: 1 }, { unique: true });

module.exports = mongoose.model("restrictedOffer", restrictedOfferSchema);
