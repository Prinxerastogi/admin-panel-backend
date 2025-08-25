let mongoose = require("mongoose");
let Schema = mongoose.Schema;
const { sellerTypes } = require("../models/logTypes");
let panelTackSchema = new Schema(
    {
      userType:{
        type: String,
      },
        type: {
            type: String,
            enum: sellerTypes,
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
