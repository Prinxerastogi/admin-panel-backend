let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let AutoIncrement = require("mongoose-sequence")(mongoose);
let mongoosastic = require("mongoosastic");
let config = require("config");

let productSchema = new Schema({
    id: { type: Number, es_indexed: true },
    name: {
        type: String,
        lowercase: true,
        index: 1,
        es_indexed: true,
        es_type: "search_as_you_type",
    },
    _name: { type: String, lowercase: true },
    description: { type: String },
    lDescription: { type: String, lowercase: true },
    shortDesc: { type: String },
    lShortDesc: { type: String, lowercase: true },
    price: Number, // it is the price-per-litre  or price-per-bottle or price-per-newspaper
    unit: String, // it can be Litre or 1 newspaper or 1 bottle
    categoryId: { type: Schema.Types.ObjectId },
    categories: [Schema.Types.ObjectId], //this shoud be array//change to categoryIds
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
            es_indexed: false,
            productId: {
                type: Schema.Types.ObjectId,
                default: null,
                es_indexed: false,
            },
            recommendedAttribute: {
                type: String,
                lowercase: true,
                es_indexed: false,
            },
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
        metaTitle: { type: String, es_indexed: true },
        metaKeywords: { type: String, es_indexed: true },
        metaDescription: { type: String, es_indexed: true },
        canonical: String,
    },
    urlKey: { type: String, lowercase: true },
    images: [{ type: String, es_indexed: true }],
    tags: [],
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
        image: [String],
        name: { type: String, lowercase: true },
        es_indexed: false,
    }, //grocery
    subBrand: {
        id: { type: Schema.Types.ObjectId },
        image: [String],
        name: { type: String, lowercase: true, es_indexed: true },
    }, //grocery
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
            value: [String],
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
        isApproved: { type: Boolean, default: false, es_indexed: true },
        es_indexed: false,
    },
    approvedBy: { type: Schema.Types.ObjectId },
    isHold: { type: Boolean, default: false },
    status: { type: String, lowercase: true, default: "new" },
    addedBy: {
        type: { type: String, lowercase: true, default: "admin" },
        id: { type: Schema.Types.ObjectId },
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
    isActive: { type: Boolean, default: false, es_indexed: true },

    veg: { type: Boolean, default: false },
    nonveg: { type: Boolean, default: false },
    recommendedAttribute: { type: String, lowercase: true },
    addmore: {},
    barCode: { type: String, lowercase: true },
    productFamilyId: { type: Schema.Types.ObjectId, default: null },
    cityIds: [],

    // gpId: Number,
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
    altBarCodes: [{ type: String, lowercase: true }],
    fssaiNo: { type: String, lowercase: true },
    isCouponApplicable: { type: Boolean, default: true },
    faq: [{}],
    howToUse: { type: String },
    benefits: { type: String },
    nutritionalFacts: [{}],

    aiDesc: { type: String, default: null },
    aiSearchkeywords: {
        type: [String],
        default: [],
        es_indexed: true,
        es_type: "search_as_you_type",
    },
    aiFAQS: { type: [Object], default: [] },
    aiUses: { type: String, default: null },
    aiBenefits: { type: String, default: null },
    aiNutritionFacts: { type: [Object], default: [] },
});
productSchema.plugin(AutoIncrement, {
    id: "productId",
    inc_field: "id" /*reference_fields: ['_id']*/,
});

productSchema.plugin(mongoosastic, {
    index: config.elasticSearch.index.products,
    hosts: config.elasticSearch.hosts,
});
// for elastic Search synchronizion
let model = mongoose.model("product", productSchema);

model.createMapping({}, (err, mapping) => {
    if (err) {
        console.log(
            "Error creating mapping (you can safely ignore this):",
            err
        );
    } else {
        console.log("Mapping created:", mapping.toString());
    }
});

let stream = model.synchronize();
let count = 0;
stream.on("data", function (err, doc) {
    count++;
});
stream.on("close", function () {
    console.log("indexed " + count + " documents!");
});
stream.on("error", function (err) {
    console.log(err);
});

mongoose.set("useCreateIndex", true);
productSchema.index({ _id: -1, id: -1 });
module.exports = mongoose.model("product", productSchema);
