let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
require("mongoose-double")(mongoose);

let jobSchema = new Schema({
    id: Number,
    distance: { type: Number }, // in meters
    duration: { type: Number }, // in seconds
    orderNo: { type: Number, unique: true },
    orderId: { type: Schema.Types.ObjectId, unique: true },
    sellerId: { type: Schema.Types.ObjectId },
    routeId: { type: Schema.Types.ObjectId, default: null },
    type: String,
    status: String, // openForAll , open , accepted , riderReached, picked, arrivedAtDestination  , completed , cancelled
    isCancelled: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    reasonForCancellation: String,
    assignedPartner: { type: Schema.Types.ObjectId },
    created: Date,
    updated: Date,
    completionTime: Date,
    acceptedTime: Date,
    pickupTime: Date,
    PickupArrivalTime: Date,
    DestinationArrivalTime: Date,
    cancellationRequestTime: Date,
    cancellationTime: Date,
    bonus: {
        _id: { type: Schema.Types.ObjectId },
        sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
        amount: { type: Number, default: 0 },
        startTime: Date,
        endTime: Date,
        title: String,
    },
    weight: { type: Number, default: 0 },
});

jobSchema.plugin(AutoIncrement, { inc_field: "id" });
module.exports = mongoose.model("job", jobSchema);
