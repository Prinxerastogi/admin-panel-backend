let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let tempOrderSchema = new Schema({
    address: {},
    cityId: { type: mongoose.Types.ObjectId, default: null },
    areaId: { type: mongoose.Types.ObjectId, default: null },
    offerId: { type: mongoose.Types.ObjectId, default: null },
    userId: { type: mongoose.Types.ObjectId, default: null },
    deliveryDate: { type: Date, default: null },
    status: { type: String, default: "pending" },
    deliveryTime: {},
    products: [],
    customerMessage: String,
    created: { type: Number },
    updated: { type: Number },
});
module.exports = mongoose.model("tempOrder", tempOrderSchema);
