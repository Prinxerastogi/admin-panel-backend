let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let mongoosastic = require("mongoosastic");
let config = require("config");

let categorySchema = new Schema({
    name: {
        type: String,
        lowercase: true,
        es_indexed: true,
        es_type: "completion",
        // es_search_analyzer: "dark_magic",
    },
    _name: { type: String, lowercase: true }, //grocery
    parentId: { type: Schema.Types.ObjectId, index: 1 },
    parentIntId: Number,
    parentIds: [],
    childIds: [{ type: Schema.Types.ObjectId, es_indexed: true }],
    seo: {
        metaTitle: String,
        metaKeywords: [String],
        metaDescription: String,
        canonical: String,
    },
    attributes: [],
    priority: Number,
    code: { type: String, default: "00" },
    urlKey: { type: String, lowercase: true },
    parent: { type: String, lowercase: true, default: "root" },
    description: { type: String, lowercase: true },
    ldescription: { type: String, lowercase: true },
    longDescription: { type: String, lowercase: true }, //grocery
    shortDescription: { type: String, lowercase: true }, //grocery
    images: [],
    parentUrl: String,
    tree: [],
    isOrder: Boolean,
    isSubscription: Boolean,
    isActive: { type: Boolean, default: false, index: 1, es_indexed: true },
    isRoot: { type: Boolean, default: false, index: 1 },
    isDeleted: { type: Boolean, default: false, es_indexed: true },
    updated: { type: Number },
    created: { type: Number },
    id: Number,
    isLeaf: { type: Boolean, default: false, es_indexed: true },
    seoUrl: { type: String, lowercase: true },
    returnPolicy: { type: String, lowercase: true },
    commission: { type: Number, default: 0 },
    date: { type: Date },
    level: Number,
    categoryBanners: [{}],
});

// Auto increment plugin
categorySchema.plugin(AutoIncrement, { inc_field: "id", id: "categoryId" });

// Mongoosastic plugin
categorySchema.plugin(mongoosastic, {
    index: config.elasticSearch.index.categorys,
    hosts: config.elasticSearch.hosts,
});

// Create the model
const Category = mongoose.model("Category", categorySchema);

// Category.createMapping(
//     {
//         mappings: {
//             properties: {
//                 name: {
//                     type: "completion",
//                     search_analyzer: "dark_magic",
//                 },
//             },
//         },
//     },
//     (err, mapping) => {
//         if (err) {
//             console.log(
//                 "Error creating mapping (you can safely ignore this):",
//                 err
//             );
//         } else {
//             console.log(
//                 "Mapping created category:",
//                 mapping.properties.name.fields
//             );
//         }
//     }
// );
// Synchronize the model with Elasticsearch
// const stream = Category.synchronize();
// let count = 0;

// stream.on("data", (err, doc) => {
//     if (err) console.error(err);
//     count++;
// });

// stream.on("close", () => {
//     console.log(`Indexed ${count} categories!`);
// });

// stream.on("error", (err) => {
//     console.error(err);
// });

// Create indexes
mongoose.set("useCreateIndex", true);
categorySchema.index({ _id: -1, id: -1 });

module.exports = Category;
