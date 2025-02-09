let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
require("mongoose-double")(mongoose);

let userSchema = new Schema({
    name: { type: String, lowercase: true },
    _name: { type: String, lowercase: true },
    urlkey: { type: String, lowercase: true },
    image: { type: String, lowercase: true },
    isActive: { type: Boolean, default: true },
    createDate: { type: Date },
    updateDate: { type: Date },
});

userSchema.plugin(AutoIncrement, { inc_field: "id", id: "tags" });
module.exports = mongoose.model("tags", userSchema);
