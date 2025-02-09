let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let attributeSchema = new Schema({
    name: String,
    type: [],
    values: [],
    code: String,
    isRequired: Boolean,
    isUnique: Boolean,
    updated: { type: Number },
    created: { type: Number },
    date: { type: Date },
    defaultValue: String,
});

attributeSchema.plugin(AutoIncrement, { inc_field: "id", id: "attributeId" });
module.exports = mongoose.model("attribute", attributeSchema);
