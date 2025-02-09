let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let adminRoleSchema = new Schema({
    name: { type: String, lowercase: true, index: 1 },
    type: String,
    permission: {},
    isDeleted: { type: Boolean, default: false },
    created: Number,
    updated: Number,
    date: { type: Date },
});

adminRoleSchema.plugin(AutoIncrement, { inc_field: "id", id: "roleId" });
module.exports = mongoose.model("adminrole", adminRoleSchema);
