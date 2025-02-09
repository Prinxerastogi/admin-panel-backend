const campaignSchema = require("../../sharedmb/schema/marketingCampaign");
const walletTransactionSchema = require("../../sharedmb/schema/walletTransaction");
const orderSchema = require("../../sharedmb/schema/order");
const userSchema = require("../../sharedmb/schema/user");

const endCampaign = async (req, res) => {
    try {
        const campaign = await campaignSchema.findOneAndUpdate(
            { _id: req.body.id, status: { $ne: "completed" } },
            { status: "completed", completionTime: new Date() },
            { new: true }
        );
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found!" });
        }
        res.status(200).json({ message: "Campaign completed!" });

        if (campaign.type === "wallet") {
            expireWalletCash(
                campaign._id,
                campaign.activationTime,
                campaign.amount
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

const expireWalletCash = async (campaignId, campaignActivationTime, amount) => {
    try {
        // Fetch all users who received the campaign cashback
        const txns = await walletTransactionSchema.find(
            { campaignId },
            { userId: 1 }
        );
        const targetedCustomersIds = txns.map((txn) => txn.userId);

        // Find users who placed an order after activation time
        const orders = await orderSchema.aggregate([
            {
                $match: {
                    userId: { $in: targetedCustomersIds },
                    status: { $ne: "cancelled" },
                    paymentSource: { $exists: true, $gt: 0 },
                    date: {
                        $gte: new Date(campaignActivationTime),
                        $lt: new Date(),
                    },
                },
            },
            {
                $project: { userId: 1 },
            },
        ]);

        const convertedCustomers = orders.map((order) =>
            order.userId.toString()
        );
        const notConvertedCustomers = targetedCustomersIds.filter(
            (id) => !convertedCustomers.includes(id.toString())
        );

        if (notConvertedCustomers.length === 0) {
            console.log("No customers to expire cashback for.");
            return;
        }

        // Get last transaction ID
        const lastTxn = await walletTransactionSchema
            .findOne()
            .sort({ _id: -1 });
        let lastId = lastTxn ? lastTxn.id : 0;

        // Create debit transactions
        const transactionsToInsert = notConvertedCustomers.map((userId) => ({
            id: ++lastId,
            userId,
            amount,
            status: "success",
            type: "debit",
            message: "Cash Expired",
            date: new Date(),
            created: new Date(),
        }));

        await walletTransactionSchema.insertMany(transactionsToInsert, {
            ordered: false,
        });

        // Deduct balance from users' wallets
        const bulkUpdates = notConvertedCustomers.map((userId) => ({
            updateOne: {
                filter: { _id: userId, walletBalance: { $gte: amount } },
                update: { $inc: { walletBalance: -amount } },
            },
        }));

        await userSchema.bulkWrite(bulkUpdates, { ordered: false });

        console.log(
            `Expired cashback for ${notConvertedCustomers.length} customers.`
        );
    } catch (error) {
        console.error("Error expiring wallet cash:", error);
    }
};

module.exports = [endCampaign];
