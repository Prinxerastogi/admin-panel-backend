let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let infoPageSchema = new Schema({
    images: [],
    isActive: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    appPage: { type: String },
    webPage: { type: String },
    title: { type: String, default: "" },
    created: { type: Date },
    updated: { type: Date },
});

infoPageSchema.plugin(AutoIncrement, { inc_field: "id", id: "infoPage" });
module.exports = mongoose.model("infopage", infoPageSchema);
