let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
require("mongoose-double")(mongoose);

let userSchema = new Schema({
    title: { type: String, lowercase: true },
    name: { type: String, lowercase: true },
    type: { type: String, lowercase: true },
    phoneNo: Number,
    email: { type: String, lowercase: true },
    password: String,
    isPasswordSet: { type: Boolean, default: false },
    isEmailVerify: { type: Boolean, default: false },
    isPhoneVerify: { type: Boolean, default: false },
    otp: Number,
    isOtpValid: { type: Boolean, default: false }, //isOtpValid
    forgot: { type: Boolean, default: false }, //isForgot
    verifyToken: String,
    forgotVerifyToken: String,
    isForgotVerifyTokenValid: { type: Boolean, default: false },
    balance: { type: Schema.Types.Double, default: 0 },
    walletBalance: { type: Number, default: 0 },
    isSoftDelete: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    created: { type: Number },
    updated: { type: Number },
    DOB: { type: Date, default: null },
    address: [
        {
            area: { type: String, lowercase: true },
            street: { type: String, lowercase: true },
            city: { type: String, lowercase: true },
            country: { type: String, lowercase: true },
            state: { type: String, lowercase: true },
            district: { type: String, lowercase: true },
            fullAddress: { type: String, lowercase: true },
            latitude: Number,
            longitude: Number,
            line1: { type: String, lowercase: true },
            line2: { type: String, lowercase: true },
            locality: { type: String, lowercase: true },
            mobileNo: Number,
            name: { type: String, lowercase: true },
            neighbourhood: { type: String, lowercase: true },
            pincode: Number,
            route: {},
            type: { type: String, lowercase: true },
            location: {},
            isDefault: { type: Boolean, default: false },
            created: Number,
            updated: Number,
            status: {
                type: String,
                enum: ["correct", "incorrect", "cannotdecide", null],
                default: null,
            },
        },
    ],
    contactUs: [
        {
            email: { type: String },
            phoneNo: { type: Number },
            name: { type: String },
            subject: { type: String },
            message: { type: String },
            created: Number,
            updated: Number,
        },
    ],
    deviceId: [],
    cart: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "product" },
            quantity: Number,
            perUserOrderQuantity: Number,
        },
    ],
    // subscriptionCart: [{
    //     productId: { type: Schema.Types.ObjectId, ref: 'product' },
    //     quantity: Number,
    // }],
    subscriptionAddress: {},
    membershipCart: [],
    date: { type: Date, default: null },
    wishlist: [],
    promocodeUseCount: { type: Number, default: 0 },
    refralCount: { type: Number, default: 0 },
    voucher: [
        {
            code: { type: String },
            voucherCodeId: { type: Schema.Types.ObjectId, ref: "vouchercode" },
        },
    ],
    vegetableCashback: {
        cashback: { type: Number, default: 0 },
        expiryDate: { type: Date, default: null },
    },
    resendOtpAttempt: { type: Number, default: 0 },
    requestOtpTime: Number,
});

userSchema.plugin(AutoIncrement, { inc_field: "id", id: "userId" });
module.exports = mongoose.model("user", userSchema);
