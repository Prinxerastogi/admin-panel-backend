let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let supplierQutotionSchema = new Schema({
    id: { type: Number },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    supplierId: { type: Schema.Types.ObjectId, ref: "supplier" },
    purchaseRequestId: { type: Schema.Types.ObjectId, ref: "purchaseRequest" },
    purchaseRequestNo: { type: Number },
    sellerAddress: {
        name: { type: String },
        address: {},
        email: { type: String },
        mobile: { type: String },
        gst: { type: String },
    },
    supplierAddress: {
        name: { type: String },
        address: {},
        email: { type: String },
        mobile: { type: String },
        gst: { type: String },
    },
    products: [
        {
            barcode: { type: String, lowercase: true },
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            productName: { type: String, lowercase: true },
            brandId: { type: Schema.Types.ObjectId, ref: "brand" },
            subBrandId: { type: Schema.Types.ObjectId, ref: "brand" },
            attribute: { type: String, lowercase: true },
            HSN: { type: String, default: null },
            GST: { type: Number, default: 0 },
            IGST: { type: Number, default: 0 },
            CGST: { type: Number, default: 0 },
            SGST: { type: Number, default: 0 },
            CESS: { type: Number, default: 0 },
            mrp: { type: Number, default: 0 },
            unitPrice: { type: Number, default: 0 }, //tax excluded price given by supplier
            purchasePrice: { type: Number, default: 0 }, //tax included price (gst included)
            purchaseQuantity: { type: Number, default: 0 },
            subTotal: { type: Number, default: 0 }, //unit price(quantity*unitPrice) total exclude tax/gst
            totalPrice: { type: Number, default: 0 }, //purchase price * purchaseQuantity (GST/tax included)
            created: { type: Date },
            updated: { type: Date },
            date: { type: Date },
            updatedDate: [{ type: Date }],
            status: { type: String }, //new,confirm,reject
        },
    ],
    totalQuantity: { type: Number, default: 0 },
    subGrandTotal: { type: Number, default: 0 }, //All products unit price(quantity*unitPrice) total exclude tax/gst
    grandTotal: { type: Number, default: 0 }, //All products price(quantity*purchaseprice) total include tax/gst
    paymentTerms: { type: String, default: "postpaid" },
    paymentDays: { type: Number, default: 7 },
    deliveryDays: { type: String },
    status: { type: String, default: "new" }, //new,confirm
    created: Number,
    updated: Number,
    date: { type: Date },
});

supplierQutotionSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "supplierQuotationId",
});
module.exports = mongoose.model("supplierqutotion", supplierQutotionSchema);
