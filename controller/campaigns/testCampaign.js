const { Types } = require("mongoose");
const campaignSchema = require("../../sharedmb/schema/marketingCampaign");
const {
    creditBalanceInUserWallet,
    sendWhatsappMessage,
} = require("./campaignUtilityFunctions");

const testCampaign = async (req, res, next) => {
    if (!req.body.id || !req.body.phoneNo) {
        return res.status(400).json({
            message: "Please provide campaign id and phone number!",
            success: false,
        });
    }

    const campaign = await campaignSchema.findOne({
        _id: Types.ObjectId(req.body.id),
    });

    if (!campaign) {
        return res
            .status(404)
            .json({ success: false, message: "Campaign not found!" });
    }

    if (campaign.type === "wallet") {
        creditBalanceInUserWallet(
            [req.body.phoneNo],
            campaign.amount,
            campaign._id
        );
    } else if (campaign.type === "message") {
        sendWhatsappMessage(
            [req.body.phoneNo],
            campaign.templateName,
            campaign.wp_imgUrl,
            campaign.wp_variables
        );
    }

    res.status(200).json({ message: "Test message sent!", success: true });
};

module.exports = [testCampaign];
