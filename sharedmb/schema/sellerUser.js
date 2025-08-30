let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let sellerUserSchema = new Schema({
    name: { type: String, lowercase: true },
    userId: { type: String, lowercase: true },
    password: String,
    created: { type: Number, index: -1 },
    updated: { type: Number },
    isActive: { type: Boolean, default: false },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "seller" },
    floatingCash: { type: Number, default: 0 },
    permissions: [
        {
            name: { type: String, lowercase: true },
            read: { type: Boolean },
            modify: { type: Boolean },
        },
    ],
    permissionsV2: [String],
});

module.exports = mongoose.model("sellerUser", sellerUserSchema);
