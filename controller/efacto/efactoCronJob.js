const cron = require("node-cron");
const webhookModel = require("../../sharedmb/schema/webhook");
const efactoUsers = require("../../sharedmb/schema/efactoUsers");
const efactoInvoices = require("../../sharedmb/schema/efactoInvoices");
const { cronJobs } = require("../../sharedmb/utility/utility");

cron.schedule(cronJobs.everyHour, async () => {
    try {
        const pendingWebhooks = await webhookModel.find({
            "status.tiers": "pending",
            type: "efacto",
        });

        for (const doc of pendingWebhooks) {
            const { data } = doc;

            if (!data || !Array.isArray(data.data)) continue;

            for (const bill of data.data) {
                if (bill.branch_id !== "4") continue;

                try {
                    // Create invoice

                    // Sanitize phone
                    const phoneNumberStr = String(bill.mobile || "").replace(
                        /\D/g,
                        ""
                    );
                    const phoneNumber =
                        phoneNumberStr.length >= 10
                            ? Number(phoneNumberStr.slice(-10))
                            : null;

                    // Parse taxable amount
                    const purchaseValue = parseFloat(bill.taxableamt || 0);

                    if (!phoneNumber || isNaN(purchaseValue)) {
                        console.warn("Skipping invalid bill:", bill);
                        continue;
                    }
                    await efactoInvoices.create({
                        invoiceNo: bill.bill_no,
                        amount: purchaseValue,
                        date: new Date(bill.bill_date.replace(" ", "T") + "Z"),
                        phoneNo: phoneNumber,
                    });
                    // Update total purchase
                    await efactoUsers.findOneAndUpdate(
                        { phoneNo: phoneNumber },
                        { $inc: { totalPurchase: purchaseValue } },
                        { upsert: true, new: true }
                    );
                } catch (innerErr) {
                    console.error("Error processing bill:", innerErr);
                }
            }

            // Mark webhook as processed
            await webhookModel.updateOne(
                { _id: doc._id },
                { $set: { "status.tiers": "processed" } }
            );
        }
    } catch (err) {
        console.error("Error in webhook cron:", err);
    }
});
