let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let AutoIncrement = require("mongoose-sequence")(mongoose);
let sellerProductSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    productId: { type: Schema.Types.ObjectId, ref: "product" },
    categoryId: { type: Schema.Types.ObjectId, ref: "category" },
    salePrice: { type: Number, default: null },
    minSellPrice: { type: Number, default: null },
    membershipPrice: { type: Number, default: null },
    sellPrice: { type: Number, default: null },
    price: { type: Number, default: null },
    discount: Number,
    offer: Number,
    quantity: { type: Number, default: 0 },
    subscriptionQuantity: { type: Number, default: 0 },
    extraService: {
        onHand: Number,
        onDoor: Number,
        withBag: Number,
        withBottle: Number,
    },
    isAvailable: Boolean, //grocery,
    isDeleted: { type: Boolean, default: false }, //grocery
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId },
    isActive: { type: Boolean, default: false },
    created: Number,
    updated: Number,
    date: { type: Date },
    perUserOrderQuantity: { type: Number, default: 0 },
    perUserSubscriptionQuantity: { type: Number, default: 0 },
    isOrder: Boolean,
    storeQuantity: { type: Number, default: 0 },
    storeMinQuantity: { type: Number, default: 0 },
    exp: Date,
    mfd: Date,
    expiryBatch: [
        {
            exp: { type: Number },
            mfg: { type: Number },
            quantity: { type: Number, default: 0 },
        },
    ],
    sku: { type: String, lowercase: true },
    competitor: {
        grofers: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        milkbasket: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        bigbasket: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        grocio: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
    },
    purchasePrice: { type: Number, default: null },
    isLastBuy: { type: Boolean, default: false },
    isSubscription: Boolean,
    isOrder: Boolean,
    isMorningBuy: Boolean,
});

sellerProductSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "sellerProductId",
});
module.exports = mongoose.model("sellerProduct", sellerProductSchema);
