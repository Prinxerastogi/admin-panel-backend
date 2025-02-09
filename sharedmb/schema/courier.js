let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CourierSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    pickupDate: String,
    pickupTime: String,
    packageCount: Number,
    senderAddress: {
        name: String,
        mobileNo: Number,
        houseNo: String,
        landmark: String,
        state: String,
        city: String,
        pincode: Number,
        addressType: String,
        area: String,
    },
    receiversAddress: {
        deliveryType: Boolean,
        Insurance: Boolean,
        name: String,
        address: String,
        pincode: Number,
        state: String,
        city: String,
        mobileNo: Number,
    },
    productDescription: {
        description: String,
        category: String,
        declaredValue: Number,
        weight: Number,
        productDimension: {
            length: Number,
            breadth: Number,
            height: Number,
        },
    },
    postalAmount: Number,
    insuranceCharge: Number,
    serviceTax: Number,
    TotalAmount: Number,
    date: { type: Date },
});

module.exports = mongoose.model("courier", CourierSchema);
