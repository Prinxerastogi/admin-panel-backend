// Import necessary modules
const mongoose = require("mongoose");
let Schema = mongoose.Schema;
// Define schema for OrderStat
const DailyStatSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    sellerId: {
        type: Schema.Types.ObjectId,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderCount: {
        type: Number,
        required: true,
    },
    deliveryCharges: {
        type: Number,
        required: true,
    },
    cancelledAmount: {
        type: Number,
        required: true,
    },
    cancelledOrderCount: {
        type: Number,
        required: true,
    },
    firstTimeUserCount: {
        type: Number,
        required: true,
    },
    SecondTimeUserCount: {
        type: Number,
        required: true,
    },
    ThirdTimeUserCount: {
        type: Number,
        required: true,
    },
    ReturningUserCount: {
        type: Number,
        required: true,
    },
    dwarkaOrders: {
        type: Number,
        required: true,
    },
    outsideOrders: {
        type: Number,
        required: true,
    },
    userRegistered: {
        type: Number,
        required: true,
    },
    grossProfit: {
        type: Number,
        required: true,
    },
});

// Create model for DailyOrdersStat
const DailyStat = mongoose.model("DailyStat", DailyStatSchema);

// Export model
module.exports = DailyStat;
