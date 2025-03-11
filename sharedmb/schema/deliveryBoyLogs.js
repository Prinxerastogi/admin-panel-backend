let mongoose = require("mongoose");
const { possibleTypes } = require("../models/logTypes");
let Schema = mongoose.Schema;

const deliveryBoyLogs = new Schema(
    {
        deliveryPartnerId: { type: Schema.Types.ObjectId, ref: "deliveryBoy" },
        type: { type: String, enum: possibleTypes },
        message: { type: String },
        admin: { type: Boolean, default: false },
        routeId: { type: Schema.Types.ObjectId, default: null },
        jobId: { type: Schema.Types.ObjectId, default: null },
        jobType: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("deliveryBoyLogs", deliveryBoyLogs);
