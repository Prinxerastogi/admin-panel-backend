require("dotenv").config();
const mongoose = require("mongoose");
const config = require("config");
const walletTransactionSchema = require("./sharedmb/schema/walletTransaction");
const orderSchema = require("./sharedmb/schema/order");
const userSchema = require("./sharedmb/schema/user"); // Import user schema

mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // keepAlive: true,
});

console.log("MongoDB Connection:", config.database);

mongoose.connection.on("error", (err) => console.error("MongoDB Error:", err));

const amount = 50;
let usersUpdated = 0,
    usersUpdateFailed = [];

const findUsers = async () => {
    try {
        const startDate = new Date("2025-01-27T00:00:00.000Z");
        const timestamp = startDate.getTime(); // Ensure correct timestamp

        // Find users who received "special cash for you"
        const transactions = await walletTransactionSchema.find(
            { message: "special cash for you", date: { $gt: startDate } },
            { userId: 1 }
        );

        const targetedCustomers = transactions.map((txn) => txn.userId);

        // Find users who have already used the special cash in an order
        const convertedUsers = await orderSchema.aggregate([
            {
                $match: {
                    userId: { $in: targetedCustomers },
                    created: { $gt: timestamp },
                    "paymentSource.wallet": { $gt: 0, $exists: true },
                    status: { $ne: "cancelled" },
                },
            },
            { $project: { userId: 1 } },
        ]);

        const convertedUserIds = new Set(
            convertedUsers.map((user) => user.userId.toString())
        );

        // Get the users who have not used the special cash
        const notConvertedCustomers = targetedCustomers.filter(
            (customer) => !convertedUserIds.has(customer.toString())
        );

        console.log(`Total Targeted Customers: ${targetedCustomers.length}`);
        console.log(`Not Converted Customers: ${notConvertedCustomers.length}`);

        if (notConvertedCustomers.length === 0) {
            console.log("No users to deduct balance from.");
            return;
        }

        const lastTxn = await walletTransactionSchema
            .findOne()
            .sort({ id: -1 });
        let lastId = lastTxn ? lastTxn.id : 0; // Get last transaction ID

        const transactionsToInsert = notConvertedCustomers.map((userId) => ({
            id: ++lastId, // Increment ID manually
            userId,
            amount,
            status: "success",
            type: "debit",
            message: "Cash Expired",
            date: new Date(),
            created: Date.now(),
        }));

        const result = await walletTransactionSchema.insertMany(
            transactionsToInsert,
            {
                ordered: false,
            }
        );

        console.log(`Transactions Created: ${result.length}`);
        usersUpdated = result.length;

        // Deduct balance from users' wallet
        const bulkUpdates = notConvertedCustomers.map((userId) => ({
            updateOne: {
                filter: { _id: userId, walletBalance: { $gte: amount } }, // Ensure wallet has enough balance
                update: { $inc: { walletBalance: -amount } },
            },
        }));

        const updateResult = await userSchema.bulkWrite(bulkUpdates, {
            ordered: false,
        });

        console.log(
            `Wallet balances updated for ${updateResult.modifiedCount} users.`
        );
    } catch (error) {
        console.error("Error:", error);
        usersUpdateFailed.push(error.message || error.toString());
    } finally {
        console.log("usersUpdated:", usersUpdated);
        console.log("usersUpdateFailed:", JSON.stringify(usersUpdateFailed));
    }
};

findUsers();
