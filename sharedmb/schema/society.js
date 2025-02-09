let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let societySchema = new Schema({
    name: { type: String, lowercase: true },
    _name: { type: String, lowercase: true },
    cityId: { type: Schema.Types.ObjectId, ref: "city", index: 1 },
    area: {},
    block: [],
    noOfBlocks: Number,
    flat: [
        {
            blockName: { type: String, lowercase: true },
            flatNo: [],
            totalFlat: Number,
        },
    ],
    townShip: { type: String, lowercase: true },
    lat: Number,
    lng: Number,
    location: {},
    date: { type: Date },
    isActive: { type: Boolean, default: false },
});

societySchema.plugin(AutoIncrement, { inc_field: "id", id: "societyId" });
module.exports = mongoose.model("society", societySchema);
