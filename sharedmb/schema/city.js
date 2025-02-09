let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let citySchema = new Schema({
    name: { type: String, lowercase: true },
    country: { type: String, lowercase: true },
    image: [],
    area: {
        type: {},
        default: { type: "Polygon" },
    },
    state: { type: String, lowercase: true, index: 1 },
    isActive: { type: Boolean, default: false },
    date: { type: Date },
    isDeleted: { type: Boolean, default: false },
});

citySchema.plugin(AutoIncrement, { inc_field: "id", id: "cityId" });
module.exports = mongoose.model("city", citySchema);
