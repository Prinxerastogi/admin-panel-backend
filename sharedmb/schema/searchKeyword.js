let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let searchKeywordSchema = new Schema({
    id: { type: Number },
    userId: { type: Schema.Types.ObjectId, ref: "user", index: 1 },
    cityId: { type: Schema.Types.ObjectId, ref: "city", index: 1 },
    ip: { type: String },
    keywords: [],
    date: { type: Date },
    epoch: Number,
    platform: [],
});

searchKeywordSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "searchkeywordId",
});
module.exports = mongoose.model("searchKeyword", searchKeywordSchema);
