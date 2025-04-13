let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let smartListSchema = new Schema({
    name: { type: String, lowercase: true },
    _name: { type: String, lowercase: true },
    config: {
        category: { type: String, lowercase: true },
        subCategory: { type: String, lowercase: true },
        leafCategory: { type: String, lowercase: true },
        brand: { type: String, lowercase: true },
        subBrand: { type: String, lowercase: true },
        minPrice: { type: Number },
        maxPrice: { type: Number },
        minDiscount: { type: Number },
        maxDiscount: { type: Number },
        tags: [{ type: String }],
    },
    isActive: { type: Boolean, default: true },
    createDate: { type: Date },
    updateDate: { type: Date },
})

smartListSchema.plugin(AutoIncrement, { inc_field: "id", id: "smartList" });
module.exports = mongoose.model("smartList", smartListSchema);