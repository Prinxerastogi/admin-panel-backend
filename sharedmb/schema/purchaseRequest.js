let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let purchaseRequestSchema = new Schema({
    id: { type: Number },
    sellerId: { type: Schema.Types.ObjectId, ref: "sellerId" },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            barcode: { type: String, lowercase: true },
            name: { type: String, lowercase: true },
            quantity: { type: Number },
            attribute: { type: String },
            brandId: { type: Schema.Types.ObjectId, ref: "brand" },
            subBrandId: { type: Schema.Types.ObjectId, ref: "brand" },
            isPurchaseOrderGenerated: { type: Boolean, default: false },
        },
    ],
    status: { type: String, lowercase: true, default: "new" }, //new,closed
    closeComment: { type: String, lowercase: true, default: "" }, //this will add on status close
    supplierQutotion: [
        {
            supplierId: { type: Schema.Types.ObjectId, ref: "supplier" },
            qutotionId: {
                type: Schema.Types.ObjectId,
                ref: "supplierQutotion",
            },
        },
    ],
    created: Number,
    updated: Number,
    date: { type: Date },
});

purchaseRequestSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "purchaseRequestId",
});
module.exports = mongoose.model("purchaseRequest", purchaseRequestSchema);
