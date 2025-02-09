let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let adminSchema = new Schema({
    name: { type: String, lowercase: true, index: 1 },
    email: { type: String, lowercase: true },
    password: String,
    type: { type: String, lowercase: true },
    isDeleted: { type: Boolean, default: false },
    created: Number,
    updated: Number,
    date: { type: Date },
    roleId: { type: mongoose.Types.ObjectId, ref: "adminrole" },
    permissions: [{}],
});

adminSchema.plugin(AutoIncrement, { inc_field: "id", id: "adminId" });
module.exports = mongoose.model("admin", adminSchema);
