let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let sellerBrandSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId },
    brandId: { type: Schema.Types.ObjectId },
    subBrandId: { type: Schema.Types.ObjectId },
    retailMargin: { type: Number, default: null },
    custMargin: { type: Number, default: null },
    created: { type: Date },
    updated: { type: Date },
});

module.exports = mongoose.model("sellerBrand", sellerBrandSchema);
