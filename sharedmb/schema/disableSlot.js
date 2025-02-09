let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let disableSlotSchema = new Schema({
    startHr: String,
    endHr: String,
    startSlot: String,
    endSlot: String,
    date: Date,
    sellerId: mongoose.Types.ObjectId,
    areaId: mongoose.Types.ObjectId,
    isCancelled: {
        type: Boolean,
        default: false,
    },
    message: String,
    created: Date,
    updated: Date,
});

disableSlotSchema.plugin(AutoIncrement, {
    id: "disableSlotId",
    inc_field: "id",
});
module.exports = mongoose.model("disableSlot", disableSlotSchema);
