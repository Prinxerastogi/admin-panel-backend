let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let blogSchema = new Schema({
    title: { type: String, lowercase: true },
    content: { type: String, lowercase: true },
    url: { type: String, lowercase: true },
    image: String,
    isDeleted: { type: Boolean, default: "false" },
    created: { type: Number },
    updated: { type: Number },
    date: { type: Date },
    Keywords: [],
    metaTitle: { type: String, lowercase: true },
    metaDescription: { type: String, lowercase: true },
    canonical: { type: String, lowercase: true },
});

blogSchema.plugin(AutoIncrement, { inc_field: "id", id: "blogId" });
module.exports = mongoose.model("blog", blogSchema);
