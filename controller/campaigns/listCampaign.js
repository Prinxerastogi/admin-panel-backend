const campaignSchema = require("../../sharedmb/schema/marketingCampaign");

const getCampaigns = async (req, res) => {
    try {
        const campaigns = await campaignSchema.find(
            { isMain: true },
            {
                name: 1,
                type: 1,
                templateName: 1,
                status: 1,
                mainCampaignId: 1,
                isMain: 1,
                id: 1,
                description: 1,
                amount: 1,
            }
        );
        res.status(200).json({
            success: true,
            message: "Campaigns fetched successfully",
            campaigns,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
            success: false,
            error: true,
        });
    }
};

module.exports = [getCampaigns];
