let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let panelTackSchema = new Schema(
    {
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: "sellerUser",
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "admin",
        },
        type: {
            type: String,
        },
        message: {
            type: String,
        },
        data: {
            type: Schema.Types.Mixed,
            default: {}
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "order",
        },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "job",
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "product",
        },
        sellerProductId: {
            type: Schema.Types.ObjectId,
            ref: "sellerproduct",
        },
        pickerId: {
            type: Schema.Types.ObjectId,
            ref: "picker",
        },
        userId: Schema.Types.ObjectId,
    },
    {
        timestamps: true, 
    }
);
module.exports = mongoose.model("panelTack", panelTackSchema);
