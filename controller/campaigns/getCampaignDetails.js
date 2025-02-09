const mongoose = require("mongoose");
const campaignSchema = require("../../sharedmb/schema/marketingCampaign");

const getCampaignDetails = async (req, res) => {
    try {
        const campaign = await campaignSchema.aggregate([
            {
                $match: {
                    id: Number(req.query.id), // Ensure matching with ObjectId
                },
            },
            {
                $lookup: {
                    from: "campaigns",
                    localField: "_id",
                    foreignField: "mainCampaignId",
                    as: "subCampaigns",
                },
            },
            {
                $lookup: {
                    from: "campaigns",
                    localField: "mainCampaignId",
                    foreignField: "_id",
                    as: "parentCampaign",
                },
            },
            {
                $unwind: {},
            },
            {
                $lookup: {
                    from: "orders",
                    let: {
                        targetCustomers: "$targetCustomers",
                        activationTime: "$activationTime",
                        completionTime: "$completionTime",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ["$status", "cancelled"] },
                                        {
                                            $in: [
                                                "$userId",
                                                "$$targetCustomers",
                                            ],
                                        },
                                        {
                                            $gte: ["$date", "$activationTime"],
                                        },
                                        {
                                            $lt: ["$date", "$completionTime"],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $addFields: {
                                isWalletMoneyUsed: {
                                    $gt: ["$paymentSource.wallet", 0], // Boolean value
                                },
                            },
                        },
                        {
                            $group: {
                                _id: "$isWalletMoneyUsed",
                                orderCount: { $sum: 1 },
                                totalAmount: { $sum: "$amount" },
                            },
                        },
                    ],
                    as: "users",
                },
            },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    name: 1,
                    description: 1,
                    type: 1,
                    status: 1,
                    amount: 1,
                    templateName: 1,
                    mainCampaignId: 1,
                    subCampaigns: 1,
                    users: 1,
                    targetCustomers: 1,
                    totalTargetCustomers: { $size: "$targetCustomers" },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            message: "Campaign fetched successfully",
            campaign: {
                ...campaign[0],
                targetCustomers: campaign[0].targetCustomers.slice(0, 20),
            },
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
            success: false,
            error: true,
        });
    }
};

module.exports = [getCampaignDetails];
