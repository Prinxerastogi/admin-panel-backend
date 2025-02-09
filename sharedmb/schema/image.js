let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let imageSchema = new Schema({
    path: String,
    folderName: String,
    images: [],
    schemaId: { type: Schema.Types.ObjectId },
    schemaName: { type: String },
    documentId: String,
});

module.exports = mongoose.model("image", imageSchema);
