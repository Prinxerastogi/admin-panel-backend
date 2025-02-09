let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let productSchema = new Schema({
    id: { type: Number },
    name: { type: String, lowercase: true, index: 1 },
    productId: { type: mongoose.Types.ObjectId, ref: "products" },
    groffersProductId: Number,
    groffersMerchantId: Number,
    milkbasketProductId: Number,
    milkbasketCityId: Number,
    milkBasketProduct: {},
    grofferProduct: {},
    created: Date,
    updated: Date,
});

productSchema.plugin(AutoIncrement, {
    id: "comapareProductId",
    inc_field: "id",
});
module.exports = mongoose.model("compareproduct", productSchema);
