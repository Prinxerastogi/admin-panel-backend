let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let completeSubscriptionSchema = new Schema({
    subscription: [],
});

module.exports = mongoose.model(
    "completeSubscription",
    completeSubscriptionSchema
);
