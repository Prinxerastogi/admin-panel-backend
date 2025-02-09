let mongoose = require("mongoose");
let AutoIncrement = require("mongoose-sequence")(mongoose);

let chatSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, default: null },
    orderId: { type: mongoose.Types.ObjectId, default: null },
    messages: [
        {
            userMsg: String,
            adminMsg: String,
            time: Number,
        },
    ],
    isDeleted: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: false },
    isNewMsg: { type: Boolean, default: false },
    roomId: String,
    userSocketId: String,
    created: Number,
    updated: Number,
});

chatSchema.plugin(AutoIncrement, { inc_field: "id", id: "chatsId" });

module.exports = mongoose.model("chats", chatSchema);
