let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let auditSchema = new Schema({
    status: { type: String, default: "inProgress" },
    sellerId: { type: Schema.Types.ObjectId },
    date: Date,
    auditName: String,
    products: [
        {
            productId: { type: Schema.Types.ObjectId, index: 1 },
            exp: { type: Number, default: null },
            mfg: { type: Number, default: null },
            isAudit: { type: Boolean, default: false },
            quantity: { type: Number, default: 0 },
        },
    ],
    created: Number,
    updated: Number,
});

auditSchema.plugin(AutoIncrement, { inc_field: "id", id: "auditId" });
module.exports = mongoose.model("audit", auditSchema);
