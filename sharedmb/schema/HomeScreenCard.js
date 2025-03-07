let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const HomeScreenCardSchema = new Schema({
    type: { type: String, lowercase: true }, // HorizontalBanner, VerticalBanner, Category, Product, Gif
    title: { type: String, lowercase: true },
    categories: [
        {
            categoryId: { type: mongoose.Types.ObjectId, ref: "category" },
        },
    ],
    deviceType: {
        type: [String],
        enum: ["Android", "Browser", "iOS"],
        default: ["Android", "Browser", "iOS"],
    },
    image: [
        {
            imgUrl: { type: String },
            productId: { type: String },
            keyword: { type: String },
            productUrl: { type: String },
            type: { type: String },
            width: { type: String },
            aspectRatio: { type: String },
        },
    ],
    categoryItems: {
        categoryId: { type: mongoose.Types.ObjectId, ref: "category" },
    },
    popularproducts: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "product" },
            displayName: { type: String },
        },
    ],
    gifUrl: { type: String },

    featureImage: { type: String }, // Single image URL
    name: { type: String, lowercase: true },
    isDeleted: { type: Boolean, default: false },
    position: Number,
    created: Number,
    updated: Number,
});

module.exports = mongoose.model("HomeScreenCard", HomeScreenCardSchema);
