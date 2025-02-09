let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let apkSchema = new Schema({
    name: { type: String, lowercase: true },
    version: { type: String, lowercase: true },
    url: String,
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    file: String,
    updated: { type: Number },
    created: { type: Number },
    date: { type: Date },
});

apkSchema.plugin(AutoIncrement, { inc_field: "id", id: "apkId" });
module.exports = mongoose.model("apk", apkSchema);
