let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let reportIssueSchema = new Schema({
    orderId: {type:Number},
    productId: [],
    description: { type: String, lowercase: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    issue: { type: String, lowercase: true },
    created: Number,
    updated: Number,
    date: { type: Date },
    email: { type: String, lowercase: true },
    phoneNo: Number,
    type: { type: String, lowercase: true },
    status: {
        type: String,
        lowercase: true,
        enum: ["new", "inprocess", "resolved", "reject"],
        default: "new",
    },
    resolutionType: { type: String, lowercase: true },
    resolutionMessage: { type: String, lowercase: true },
});

reportIssueSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "reportIssueId",
});
module.exports = mongoose.model("reportIssue", reportIssueSchema);
