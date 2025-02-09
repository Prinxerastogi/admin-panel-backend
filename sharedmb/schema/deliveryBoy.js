let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);

let deliveryBoySchema = new Schema(
    {
        sellerId: { type: Schema.Types.ObjectId, ref: "seller" },
        otp: { type: String, default: null },
        name: { type: String, default: null },
        phoneNo: { type: Number, default: null, unique: true },
        isActive: { type: Boolean, default: true },
        drivingLicNo: { type: String, default: null },
        vehicleType: { type: String },
        withdrawalAllowed: { type: Boolean, default: false },
        panCardDetails: {
            is_valid: Boolean,
            pan_number: String,
            dob: String,
            name: String,
            father_name: String,
            verifiedDate: Date,
            image: String,
        },
        bankAccountDetails: {
            is_valid: Boolean,
            account_name: String,
            account_number: String,
            ifsc: String,
            percentage_match: Number,
            verifiedDate: Date,
        },
        image: {
            image: String,
            verifiedDate: Date,
        },
        tncAccepted: { type: Boolean, default: false },
        tncAcceptedDate: Date,
        easeBuzzContact: {},
        easeBuzzBenificiaryId: String,
        status: { type: String, default: "offline" },
        created: Date,
        updated: Date,
        fcmUpdated: Date,
        currentBalance: {
            type: Number,
            default: 0,
            get: (value) => parseFloat(value.toFixed(2)), // Ensure two decimal places
            set: (value) => parseFloat(value.toFixed(2)),
        },
        floatingCash: {
            type: Number,
            default: 0,
            get: (value) => parseFloat(value.toFixed(2)), // Ensure two decimal places
            set: (value) => parseFloat(value.toFixed(2)),
        },
        isVerified: { type: Boolean, default: false },
        isDisabled: { type: Boolean, default: false },
        requestOtpTime: { type: Date },
        fcmToken: { type: String },
        ranking: { type: Number, default: 1000 },
        rating: { type: Number },
        onlineTime: { type: Date },
        offlineTime: { type: Date },
    },
    {
        toObject: { getters: true, setters: true },
        toJSON: { getters: true, setters: true },
        runSettersOnQuery: true,
    }
);

deliveryBoySchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "deliveryBoyId",
});
module.exports = mongoose.model("deliveryboy", deliveryBoySchema);
