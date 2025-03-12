const deliveryBoyTransactionSchema = require("../../sharedmb/schema/deliveryBoyTransactions");
const deliveryBoySchema = require("../../sharedmb/schema/deliveryBoy");

const deductAmount = async (req, res) => {
    try {
        const { deliveryPartnerId } = req.body;
        const deductionAmount = 120; 

        const deliveryBoy = await deliveryBoySchema.findById(deliveryPartnerId);
        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: "Delivery boy not found" });
        }

       
       let openingBalance = deliveryBoy.currentBalance || 0;
       const closingBalance = openingBalance - deductionAmount;

        const newTransaction = new deliveryBoyTransactionSchema({
            type: "debit",
            deliveryPartnerId,
            created: new Date(),
            updated: new Date(),
            amount: deductionAmount,
            openingBalance: openingBalance,
            closingBalance: closingBalance,
            remarks: "Bike Rent",
        });

        const savedTransaction = await newTransaction.save();
        if (!savedTransaction) {
            return res.status(201).json({ success: false, message: "Failed to save transaction" });
        }

        const updatedDeliveryBoy = await deliveryBoySchema.findOneAndUpdate(
            { _id: deliveryPartnerId },
            { $inc: { currentBalance: -deductionAmount } },
            { new: true }
        );
        
        if (!updatedDeliveryBoy) {
            return res.status(201).json({ success: false, message: "Failed to update balance" });
        }

        return res.json({ success: true, message: "Amount deducted successfully", closingBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = [deductAmount];
