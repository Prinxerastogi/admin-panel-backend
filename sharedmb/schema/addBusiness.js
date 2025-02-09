let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let addBusinessSchema = new Schema({
    businessName: String,
    ownerName: String,
    contact: Number,
    address: String,
    created: Number,
    updated: Number,
    products: [
        {
            name: String,
            brandName: String,
            unit: String,
            mrp: Number,
            purchasePrice: Number,
            created: Number,
            updated: Number,
        },
    ],
});

addBusinessSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "businessSurveyId",
});

module.exports = mongoose.model("businessSurvey", addBusinessSchema);
