let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let damageStockSchema = new Schema({
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "products" },
            quantity: Number,
            stockQuantity: Number,
            hsnCode: String,
            gst: Number,
            purchasePrice: Number,
            totalPrice: Number,
            reason: String,
        },
    ],
    totalQuantity: Number,
    totalAmount: Number,
    created: Date,
    updated: Date,
});

damageStockSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "damageStockId",
});
module.exports = mongoose.model("damagestock", damageStockSchema);
