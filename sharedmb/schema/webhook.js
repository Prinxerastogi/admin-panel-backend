let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const webhookSchema = new Schema(
    {
        data: Schema.Types.Mixed,
        type: { type: String, default: "unknown" },
        status: {
            tiers: { type: String, default: "pending" },
            sellerstock: { type: String, default: "pending" },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("webhook", webhookSchema);
