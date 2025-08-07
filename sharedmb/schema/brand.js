let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let mongoosastic = require("mongoosastic");
let config = require("config");

let brandSchema = new Schema({
    name: { type: String },
    _name: { type: String, lowercase: true },
    lName: { type: String, lowercase: true },
    image: [],
    tags: [],
    isRootBrand: { type: Boolean, default: false },
    parentId: { type: mongoose.Types.ObjectId, ref: "brands" },
    childIds: [], //brandIds
    description: { type: String },
    lDescription: { type: String, lowercase: true },
    isActive: { type: Boolean, default: true },
    level: Number,
    updated: { type: Number },
    created: { type: Number },
    date: { type: Date },
});

brandSchema.plugin(AutoIncrement, { inc_field: "id", id: "brandId" });

// Mongoosastic plugin
brandSchema.plugin(mongoosastic, {
    index: config.elasticSearch.index.brands,
    hosts: config.elasticSearch.hosts,
});

// // Create the model
const Brand = mongoose.model("Brand", brandSchema);

try {
    // // Synchronize the model with Elasticsearch
    const stream = Brand.synchronize();
    let count = 0;

    stream.on("data", (err, doc) => {
        if (err) console.error(err);
        count++;
    });

    stream.on("close", () => {
        console.log(`Indexed ${count} brands!`);
    });

    stream.on("error", (err) => {
        console.error(err);
    });
} catch (err) {
    console.error("Failed to start synchronization:", err);
}

mongoose.set("useCreateIndex", true);
brandSchema.index({ _id: -1, id: -1 });

module.exports = Brand;
