let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let mongoosastic = require("mongoosastic");
let config = require("config");

let brandSchema = new Schema({
    name: { type: String, es_indexed: true }, // Will be indexed in ES
    _name: { type: String, lowercase: true, es_indexed: false }, // NOT indexed in ES
    lName: { type: String, lowercase: true, es_indexed: true },
    image: { type: Array, es_indexed: false }, // skip indexing large/unnecessary fields
    tags: { type: Array, es_indexed: true },
    isRootBrand: { type: Boolean, default: false, es_indexed: true },
    parentId: {
        type: mongoose.Types.ObjectId,
        ref: "brands",
        es_indexed: false,
    },
    childIds: { type: Array, es_indexed: false },
    description: { type: String, es_indexed: true },
    lDescription: { type: String, lowercase: true, es_indexed: false },
    isActive: { type: Boolean, default: true, es_indexed: true },
    level: { type: Number, es_indexed: true },
    updated: { type: Number, es_indexed: false },
    created: { type: Number, es_indexed: false },
    date: { type: Date, es_indexed: true },
});

brandSchema.plugin(AutoIncrement, { inc_field: "id", id: "brandId" });

// Mongoosastic plugin
brandSchema.plugin(mongoosastic, {
    index: config.elasticSearch.index.brands,
    hosts: config.elasticSearch.hosts,
    saveOnSynchronize: false,
    clientOptions: {
        nodes: config.elasticSearch.hosts,
    },
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


brandSchema.index({ _id: -1, id: -1 });

module.exports = Brand;
