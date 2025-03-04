let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
// let mongoosastic = require('mongoosastic');
let config = require("config");

let productSchema = new Schema({
    id: { type: Number },
    name: { type: String, lowercase: true, index: 1 },
    _name: { type: String, lowercase: true },
    description: { type: String },
    faq: [{}],
    howToUse: { type: String },
    benefits: { type: String },
    nutritionalFacts: [{}],
    nutritionalBaseQuantity: { type: String },
    lDescription: { type: String, lowercase: true },
    shortDesc: { type: String },
    lShortDesc: { type: String, lowercase: true },
    price: Number, // it is the price-per-litre  or price-per-bottle or price-per-newspaper
    unit: String, // it can be Litre or 1 newspaper or 1 bottle
    categoryId: { type: Schema.Types.ObjectId },
    categories: [], //this shoud be array//change to categoryIds
    tags: [{ type: Schema.Types.ObjectId, ref: "tags" }],
    rating: Number,
    gst: Number,
    gstId: { type: Schema.Types.ObjectId },
    gstDesc: { type: String, lowercase: true },
    hsnCode: String,
    availability: Boolean,
    quantity: { type: Number, default: 0 },
    subscriptionQuantity: { type: Number, default: 0 },
    perUserOrderQuantity: { type: Number, default: 0 },
    perUserSubscriptionQuantity: { type: Number, default: 0 },
    parentId: { type: Schema.Types.ObjectId, default: null },
    isParent: { type: Boolean, default: true },
    childProducts: [
        {
            productId: { type: Schema.Types.ObjectId, default: null },
            recommendedAttribute: { type: String, lowercase: true },
        },
    ],
    extraService: {
        inHandPrice: Number,
        onDoorPrice: Number,
        withBagPrice: Number,
        withBottlePrice: Number,
        es_indexed: false,
    },
    seo: {
        metaTitle: { type: String, es_indexed: false },
        metaKeywords: { type: String, es_indexed: true },
        metaDescription: { type: String, es_indexed: false },
        canonical: String,
    },
    urlKey: { type: String, lowercase: true },
    images: [],
    images_demo: { type: String },
    assets: {
        images: [
            {
                width: String,
                height: String,
                src: String,
            },
        ],
        es_indexed: false,
    },
    searchingNumber: { type: Number, default: 0 }, //grocery
    offer: Number, //grocery
    membershipPrice: { type: Number, default: 0 }, //grocery
    isLastBuy: { type: Boolean, default: false }, //grocery
    isDeleted: { type: Boolean, default: false }, //grocery
    isDailyDeal: { type: Boolean, default: false }, //grocery
    isFeatureSale: { type: Boolean, default: false }, //grocery
    isSubscription: Boolean, //grocery
    isOrder: Boolean, //grocery
    isMorningBuy: Boolean, //grocery
    brand: {
        id: { type: Schema.Types.ObjectId },
        image: [],
        name: { type: String, lowercase: true },
        es_indexed: false,
    }, //grocery
    subBrand: {
        id: { type: Schema.Types.ObjectId },
        image: [],
        name: { type: String, lowercase: true, es_indexed: true },
    }, //grocery
    companyName: { type: String, default: null },
    shipping: {
        unit: { type: String, default: "mm" },
        dimensions: {
            height: {
                type: Number,
                default: 0,
            },
            length: {
                type: Number,
                default: 0,
            },
            width: {
                type: Number,
                default: 0,
            },
        },
        weight: { type: Number, default: 0 },
        weightUnit: { type: String, default: "grm" },
        es_indexed: false,
    },
    attrs: [
        {
            name: { type: String, lowercase: true },
            value: [],
            es_indexed: false,
        },
    ], //grocery
    variants: {
        attrs: [
            {
                displayType: { type: String, lowercase: true },
                name: { type: String, lowercase: true },
            },
        ],
        es_indexed: false,
    },
    verification: {
        isImageVerify: { type: Boolean, default: false },
        isproductDetailVerify: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        es_indexed: false,
    },
    approvedBy: { type: Schema.Types.ObjectId },
    isHold: { type: Boolean, default: false },
    status: { type: String, lowercase: true, default: "new" },
    addedBy: {
        type: { type: String, lowercase: true, default: "admin" },
        id: { type: Schema.Types.ObjectId },
        es_indexed: false,
    },
    sku: { type: String, lowercase: true },
    // mbSku: { type: String, lowercase: true },
    skuDescription: {
        type: String,
        lowercase: true,
        default: "metro wholesale",
    },
    minSellPrice: { type: Number, default: null },
    sellPrice: Number,
    size: {
        length: {
            type: Number,
            default: 0,
        },
        width: {
            type: Number,
            default: 0,
        },
        height: {
            type: Number,
            default: 0,
        },
        es_indexed: false,
    },
    sizeUnit: {
        type: String,
        default: "CM",
    },
    created: Number,
    updated: Number,
    date: { type: Date },
    isActive: { type: Boolean, default: false },

    veg: { type: Boolean, default: false },
    nonveg: { type: Boolean, default: false },
    recommendedAttribute: { type: String, lowercase: true },
    addmore: {},
    barCode: { type: String, lowercase: true },
    productFamilyId: { type: Schema.Types.ObjectId, default: null },
    cityIds: [],
    fssaiNo: { type: String, lowercase: true },
    // gpId: Number,
    // gmId: Number,
    // mpId: Number,
    // mcId: Number,
    competitor: {
        grofers: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        milkbasket: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        bigbasket: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        grocio: {
            productId: { type: String },
            merchantId: { type: String },
            lastPrice: Number,
        },
        es_indexed: false,
    },
    purchasePrice: Number,
    manufacturerDetails: { type: String, lowercase: true },
    country: { type: String, lowercase: true },
    expiryMonth: { type: String, lowercase: true },
    isCouponApplicable: { type: Boolean, default: true },
});
productSchema.plugin(AutoIncrement, {
    id: "productId",
    inc_field: "id" /*reference_fields: ['_id']*/,
});

// productSchema.plugin(mongoosastic, {
//     index: config.elasticSearch.index.products,
//     hosts: config.elasticSearch.hosts
// });

// // for elastic Search synchronizion
let model = mongoose.model("product", productSchema);

// let stream = model.synchronize();
// let count = 0;
// stream.on('data', function (err, doc) {
//     count++;
// });
// stream.on('close', function () {
//     console.log('indexed ' + count + ' documents!');
// });
// stream.on('error', function (err) {
//     console.log(err);
// });

module.exports = mongoose.model("product", productSchema);
