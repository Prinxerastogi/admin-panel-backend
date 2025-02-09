let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let referalSchema = new Schema({
    offer: {
        senderAmount: Number,
        recieverAmount: Number,
    },
    userId: { type: mongoose.Types.ObjectId, default: null },
    referalUsers: [],
    code: { type: String, lowercase: true },
    created: Number,
    updated: Number,
});

referalSchema.plugin(AutoIncrement, { inc_field: "id", id: "referalId" });
module.exports = mongoose.model("referal", referalSchema);
