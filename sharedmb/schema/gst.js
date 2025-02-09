let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let gstSchema = new Schema({
    hsnCode: Number,
    description: { type: String, lowercase: true },
    gstRate: Number,
    cess: Number,
});

gstSchema.plugin(AutoIncrement, { inc_field: "id", id: "gstId" });
module.exports = mongoose.model("gst", gstSchema);
