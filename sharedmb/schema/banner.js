let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let bannerSchema = new Schema({
    priority: Number,
    title: { type: String, lowercase: true },
    isActive: { type: Boolean, default: false },
    sellerId: { type: mongoose.Types.ObjectId, ref: "seller" },
    banners: [
        {
            image: [],
            name: { type: String, lowercase: true },
            isDeleted: { type: Boolean, default: false },
            position: Number,
            searchKeywordWeb: { type: String },
            searchKeywordApp: { type: String },
            created: Number,
            updated: Number,
            date: Date,
        },
    ],
    isDeleted: { type: Boolean, default: false },
    created: Number,
    updated: Number,
    date: Date,
});

bannerSchema.plugin(AutoIncrement, { inc_field: "id", id: "bannerId" });
module.exports = mongoose.model("banner", bannerSchema);
