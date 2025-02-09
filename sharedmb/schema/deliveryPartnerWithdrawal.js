let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let deliveryBoyWithdrawalSchema = new Schema(
    {
        deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "deliveryboy" },
        id: { type: Number, unique: true },
        created: Date,
        updated: Date,
        amount: {
            type: Number,
            get: (value) => parseFloat(value.toFixed(2)), // Ensure two decimal places
            set: (value) => parseFloat(value.toFixed(2)),
        },
        status: { type: String },
        remarks: String,
        response: {},
        actionDate: Date,
    },
    {
        toObject: { getters: true, setters: true },
        toJSON: { getters: true, setters: true },
        runSettersOnQuery: true,
    }
);

deliveryBoyWithdrawalSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "deliveryBoyWithdrawalReqId",
});
module.exports = mongoose.model(
    "deliveryBoyWithdrawalSchema",
    deliveryBoyWithdrawalSchema
);
