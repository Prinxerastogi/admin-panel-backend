let mongoose = require("mongoose");

let configSchema = mongoose.Schema({
    referrerAmount: { type: Number, default: null },
    refereeAmount: { type: Number, default: null },
    android_minimum_version: String,
    ios_minimum_version: String,
    title_message: String,
    whatsnew_release: String,
    ios_app_appstore_url: String,
    message_for_update: String,
    mandatory_update: Boolean,
    whatsapp_campaign_details: [
        {
            templateName: String,
            time: String,
            media_link: String,
            messageType: String, //  image, video, document
            orderStatus: String, // delivered
            minOrderAmount: Number,
            maxOrderAmount: Number,
            deviceType: String, // ios, android, web, all
            minProductQuantity: Number,
            maxProductQuantity: Number,
            minOrderCount: Number,
            maxOrderCount: Number,
            // type: { type: String },
        },
    ],
    chat_tags: [
        {
            type: String,
            unique: true,
        },
    ],
});
exports.configSchema = configSchema;

module.exports = mongoose.model("config", configSchema);
