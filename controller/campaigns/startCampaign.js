const { Types } = require("mongoose");
const campaignSchema = require("../../sharedmb/schema/marketingCampaign");
const {
    creditBalanceInUserWallet,
    sendWhatsappMessage,
} = require("./campaignUtilityFunctions");

const startCampaign = async (req, res) => {
    try {
        const campaign = await campaignSchema.findOneAndUpdate(
            {
                _id: Types.ObjectId(req.body.id),
                status: { $nin: ["active", "completed"] },
            },
            { status: "active", activationTime: new Date() }
        );
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found!" });
        }
        res.status(200).json({ message: "Campaign completed!" });

        let targetCustomers = [];
        if (campaign.isMain) {
            targetCustomers = campaign.targetCustomers;
        } else {
            const parentCampaign = await campaignSchema.findOne({
                _id: Types.ObjectId(campaign.parentCampaignId),
            });
            targetCustomers = parentCampaign.targetCustomers;
        }
        if (campaign.type === "wallet") {
            creditBalanceInUserWallet(
                targetCustomers,
                campaign.amount,
                campaign._id
            );
        } else if (campaign.type === "message") {
            // Send whatsapp message
            sendWhatsappMessage(
                targetCustomers,
                campaign.templateName,
                campaign.imgUrl,
                campaign.wp_variables
            );
        }
    } catch (error) {
        res.status(400).json({
            message: error.message,
            success: false,
            error: true,
        });
    }
};

module.exports = [startCampaign];
