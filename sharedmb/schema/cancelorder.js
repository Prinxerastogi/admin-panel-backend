let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let cancelOrderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    orderId: { type: Schema.Types.ObjectId, ref: "order" },
    sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
    status: { type: String, lowercase: true },
    created: Number,
    updated: Number,
    date: { type: Date },
});
cancelOrderSchema.plugin(AutoIncrement, {
    id: "cancelorderId",
    inc_field: "id" /*reference_fields: ['_id']*/,
});
module.exports = mongoose.model("cancelorder", cancelOrderSchema);
