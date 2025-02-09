let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let productFamilySchema = new Schema({
    name: { type: String, lowercase: true, unique: true },
    productIds: [],
    date: Date,
    updated: Number,
    created: Number,
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
});

productFamilySchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "productFamilyId",
});
module.exports = mongoose.model("productFamily", productFamilySchema);
