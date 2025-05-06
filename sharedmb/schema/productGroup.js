const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

const productGroupSchema = new Schema({
    name: { type: String, lowercase: true },
    id: { type: Number, unique: true },
    products: [{ type: Number }],
});
productGroupSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "productGroupId`",
});
module.exports = mongoose.model("productGroup", productGroupSchema);
