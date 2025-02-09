let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let GRLSchema = new Schema({
    id: { type: Number },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    supplierId: { type: Schema.Types.ObjectId, ref: "supplier" },
    purchaseRequestId: { type: Schema.Types.ObjectId, ref: "purchaseRequest" },
    purchaseRequestNo: { type: Number },
    supplierQuotationId: {
        type: Schema.Types.ObjectId,
        ref: "supplierQutotion",
    },
    supplierQuotationNo: { type: Number },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: "purchaseOrder" },
    purchaseOrderNo: { type: Number },
    grnId: { type: Schema.Types.ObjectId, ref: "grn" },
    grnNo: { type: Number },
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
            purchaseOrderProductId: { type: Schema.Types.ObjectId },
            GRLQuantity: { type: Number, default: 0 },
            GRLTotalPrice: Number,
            GRNQuantity: { type: Number, default: 0 },
            GRNTotalPrice: Number,
            exp: Date,
            mfg: Date,
            barcode: { type: String, lowercase: true },
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            productName: { type: String, lowercase: true },
            brandId: { type: Schema.Types.ObjectId, ref: "brand" },
            subBrandId: { type: Schema.Types.ObjectId, ref: "brand" },
            attribute: { type: String, lowercase: true },
            reason: { type: String, default: null },
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
        },
    ],
    totalQuantity: { type: Number, default: 0 },
    GRLTotalQuantity: { type: Number, default: 0 },
    subGrandTotal: { type: Number, default: 0 }, //All products unit price(quantity*unitPrice) total exclude tax/gst
    grandTotal: { type: Number, default: 0 }, //All products price(quantity*purchaseprice) total include tax/gst
    GRLGrandTotal: { type: Number, default: 0 },
    //invoice
    invoiceNumber: { type: String },
    invoiceDate: Date,
    invoiceImages: [],
    //payment
    payment: {
        supplierName: { type: String, lowercase: true },
        supplierIFSC: { type: String, lowercase: true },
        totalPrice: Number,
        grandTotal: Number,
        type: String, // cheque,neft,cash,upi
        transaction: {},
    },
    ispayment: { type: Boolean, default: false },
    paymentTerms: { type: String },
    paymentDays: { type: Number, default: 0 },
    created: { type: Date },
    updated: { type: Date },
    date: { type: Date },
});

GRLSchema.plugin(AutoIncrement, { inc_field: "id", id: "grlId" });
module.exports = mongoose.model("grl", GRLSchema);
