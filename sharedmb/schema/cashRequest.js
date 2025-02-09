let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let cashRequestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    amount: Number,
    timeSlot: {},
    address: {
        area: { type: String, lowercase: true },
        street: { type: String, lowercase: true },
        city: { type: String, lowercase: true },
        country: { type: String, lowercase: true },
        state: { type: String, lowercase: true },
        district: { type: String, lowercase: true },
        fullAddress: { type: String, lowercase: true },
        latitude: Number,
        longitude: Number,
        line1: { type: String, lowercase: true },
        line2: { type: String, lowercase: true },
        locality: { type: String, lowercase: true },
        mobileNo: Number,
        name: { type: String, lowercase: true },
        neighbourhood: { type: String, lowercase: true },
        pincode: Number,
        route: {},
        type: { type: String, lowercase: true },
        location: {},
        isDefault: { type: Boolean, default: false },
        created: Number,
        updated: Number,
    },
    status: { type: String, lowercase: true, default: "new" },
    acceptedBy: { type: Schema.Types.ObjectId },
    deliveredBy: { type: Schema.Types.ObjectId },
    generatedBy: { type: Schema.Types.ObjectId },
    created: Number,
    updated: Number,
    date: { type: Date },
    voucherCode: { type: String, default: "XXXXXXXXXXXXXXXX" },
});

cashRequestSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "cashRequestId",
});
module.exports = mongoose.model("cashrequest", cashRequestSchema);
