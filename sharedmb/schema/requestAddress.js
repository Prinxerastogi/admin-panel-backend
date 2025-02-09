let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let requestAddressSchema = new Schema({
    id: { type: Number },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller", index: 1 },
    status: { type: String, default: "new" },
    societies: [],
    cities: [],
    created: { type: Number },
    updated: { type: Number },
    date: { type: Date },
});

requestAddressSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "requestAddressId",
});
module.exports = mongoose.model("requestAddress", requestAddressSchema);
