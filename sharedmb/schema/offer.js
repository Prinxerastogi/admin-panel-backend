let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let offerSchema = new Schema({
    name: { type: String, lowercase: true },
    sellerId: { type: Schema.Types.ObjectId },
    promocode: { type: String, lowercase: true, unique: true },
    isPercent: Boolean,
    discount: Number,
    minOrderPrice: Number,
    maxOrderPrice: Number,
    useCount: Number,
    maxDiscount: Number,
    startDate: Date,
    expireDate: Date,
    productOffer: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    type: { type: String, lowercase: true }, //instant,cashback
    offerUserType: { type: String, lowercase: true }, // existing,newuser
    description: { type: String, lowercase: true },
    cartDescription: { type: String, lowercase: true },
    created: Number,
    updated: Number,
    date: Date,
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            minQuantity: Number,
            maxQuantity: Number,
        },
    ],
    isAppOnly: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    minOfferProductInCart: { type: Number, default: 0 },
    //refral code
    refralAmount: {
        senderAmount: Number,
        recieverAmount: Number,
    },
    offerType: String, //refral,affliate,offer,
    userId: { type: Schema.Types.ObjectId, ref: "user" },
});

offerSchema.plugin(AutoIncrement, { inc_field: "id", id: "offerId" });
module.exports = mongoose.model("offer", offerSchema);
