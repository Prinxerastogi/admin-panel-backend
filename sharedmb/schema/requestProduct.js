let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let requestProductSchema = new Schema({
    id: { type: Number },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller", index: 1 },
    _name: { type: String, lowercase: true },
    name: { type: String, lowercase: true },
    price: { type: Number },
    quantity: { type: Number },
    image: [],
    isDeleted: { type: Boolean, default: "false" },
    created: { type: Number },
    updated: { type: Number },
    date: { type: Date },
});

requestProductSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "requestProductId",
});
module.exports = mongoose.model("requestProduct", requestProductSchema);
