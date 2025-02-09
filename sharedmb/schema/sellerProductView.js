let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let productViewSchema = new Schema({
    name: { type: String },
    priority: Number,
    sellerProduct: [],
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    sellerId: { type: mongoose.Types.ObjectId, default: null },
    seo: {
        title: String,
        keyword: String,
        url: String,
        description: String,
    },
    created: Date,
    updated: Date,
});

productViewSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "sellerProductViewId",
});
module.exports = mongoose.model("sellerProductView", productViewSchema);
