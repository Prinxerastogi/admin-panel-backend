let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let variantSchema = new Schema({
    name: { type: String, lowercase: true },
    lname: { type: String, lowercase: true },
    price: Number,
    productId: { type: Schema.Types.ObjectId, ref: "product", index: 1 },
    assets: {
        images: [
            {
                width: String,
                height: String,
                src: String,
            },
        ],
    },
    attrs: [
        {
            name: { type: String, lowercase: true },
            value: { type: String, lowercase: true },
        },
    ],
    created: Number,
    updated: Number,
    date: { type: Date },
});

variantSchema.plugin(AutoIncrement, { inc_field: "id", id: "variantId" });
module.exports = mongoose.model("variant", variantSchema);
