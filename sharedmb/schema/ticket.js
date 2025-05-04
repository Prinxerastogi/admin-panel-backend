


let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let ticketSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        orderId: { type: Schema.Types.ObjectId, ref: "order" },
        chats: [
            {
                source: { type: String, enum: ["server", "customer"] },
                message: String,
                command: String,
                buttons: [
                    {
                        title: String,
                        code: String,
                        metadata: {},
                    },
                ],
                date: { type: Date, default: Date.now },
                images: [String],
                isFirstCustomMessage: { type: Boolean, default: false },
            },
        ],
        id: {
            type: Number,
        },
        ticketStatus: {
            type: String,
            default: "open",
        },
        ticketTag: { type: String, default: null },
        chatProgress: { type: String, default: "active" },
        note: {
            type: String,
            default: null,
        },
        isUnread: {
            type: Boolean,
            default: false,
        },
        isConnected: {
            type: Boolean,
            default: false,
        },
        resolution: {
            type: String,
        },
        resolutionTime: {
            type: Date,
        },
    },
    { timestamps: true }
);
ticketSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "ticketId",
});
module.exports = mongoose.model("ticket", ticketSchema);