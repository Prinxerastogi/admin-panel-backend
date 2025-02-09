let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let cronJobSchema = new Schema({
    message: String,
    created: Number,
    updated: Number,
    transactionData: [],
    refundTransaction: [],
    completeSubscription: [],
    endingSubscription: [],
    type: String,
    cronName: String,
    orders: [],
    offer: [],
    notes: [],
    products: [],
});

module.exports = mongoose.model("cron", cronJobSchema);
