const { description } = require("joi");
const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        id: { type: Number, unique: true },
        name: String,
        description: String,
        type: String,
        status: String,
        isMain: { type: Boolean, default: true },
        amount: Number,

        templateName: String,
        mainCampaignId: { type: mongoose.Schema.Types.ObjectId, default: null },
        targetCustomers: [{ type: String }],
        activationTime: Date,
        completionTime: Date,

        wp_imgUrl: String,
        wp_variables: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

campaignSchema.plugin(require("mongoose-sequence")(mongoose), {
    inc_field: "id",
    id: "marketingCampaignId",
});

module.exports = mongoose.model("campaign", campaignSchema);
