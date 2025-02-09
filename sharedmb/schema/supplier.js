let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let supplierSchema = new Schema({
    name: { type: String, lowercase: true },
    address: {
        address1: { type: String, lowercase: true },
        address2: { type: String, lowercase: true },
        landmark: { type: String, lowercase: true },
        city: { type: String, lowercase: true },
        state: { type: String, lowercase: true },
        pincode: { type: Number },
    },
    mobile1: Number,
    mobile2: Number,
    email1: { type: String, lowercase: true },
    email2: { type: String, lowercase: true },
    fssai: { type: String },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    bank: {
        accountHolderName: { type: String, lowercase: true },
        bankName: { type: String, lowercase: true },
        accountNo: { type: Number },
        ifsc: { type: String, lowercase: true },
        accountType: { type: String, lowercase: true },
        cancelCheque: [],
        branchAddress: { type: String, lowercase: true },
    },
    brand: [
        {
            name: { type: String, lowercase: true },
            brandId: { type: Schema.Types.ObjectId },
        },
    ],
    subBrand: [
        {
            name: { type: String, lowercase: true },
            subBrandId: { type: Schema.Types.ObjectId },
        },
    ],
    categories: [],
    username: { type: String, lowercase: true }, //unique
    password: { type: String },
    gstin: { type: String, lowercase: true },
    panNo: { type: String, lowercase: true },
    isApprove: { type: Boolean, default: false },
    isActivate: { type: Boolean, default: false },
    created: Date,
    updated: Date,
    date: { type: Date },
});

supplierSchema.plugin(AutoIncrement, { inc_field: "id", id: "supplierId" });
module.exports = mongoose.model("supplier", supplierSchema);
