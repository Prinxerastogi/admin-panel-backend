let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let orderSettingSchema = new Schema({});

orderSettingSchema.plugin(AutoIncrement, { inc_field: "id", id: "sellerId" });
module.exports = mongoose.model("seller", sellerSchema);
