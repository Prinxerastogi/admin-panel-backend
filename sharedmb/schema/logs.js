let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
require("mongoose-double")(mongoose);

let logsSchema = new Schema({
    createDate: { type: Date },
    updateDate: { type: Date },
    apiName: { type: String },
    userName: { type: String },
    timeStamp: { type: String },
    requestURL: { type: String },
    requestBody: { type: String },
});

logsSchema.plugin(AutoIncrement, { inc_field: "id", id: "tags" });
module.exports = mongoose.model("adminlogs", logsSchema);
