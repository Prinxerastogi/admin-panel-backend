let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let barndSchema = new Schema({
    name: { type: String },
    _name: { type: String, lowercase: true },
    lName: { type: String, lowercase: true },
    image: [],
    tags: [],
    isRootBrand: { type: Boolean, default: false },
    parentId: { type: mongoose.Types.ObjectId, ref: "brands" },
    childIds: [], //brandIds
    description: { type: String },
    lDescription: { type: String, lowercase: true },
    isActive: { type: Boolean, default: true },
    level: Number,
    updated: { type: Number },
    created: { type: Number },
    date: { type: Date },
});

barndSchema.plugin(AutoIncrement, { inc_field: "id", id: "brandId" });
module.exports = mongoose.model("brand", barndSchema);
