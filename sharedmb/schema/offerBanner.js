let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

offerBannerSchema = new Schema({
    banners: [
        {
            name: { type: String, lowercase: true },
            isDeleted: { type: Boolean, default: false },
            isActive: { type: Boolean, default: false },
            searchKeywordApp: { type: String },
            image: [],
            priority: Number,
            created: Date,
            updated: Date,
        },
    ],
    isUspBanner: { type: Boolean, default: false },
    sellerId: { type: mongoose.Types.ObjectId, default: null },
});

offerBannerSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "offerBannerId",
});
module.exports = mongoose.model("offerBanner", offerBannerSchema);
