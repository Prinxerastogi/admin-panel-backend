let productSchema = require("../../sharedmb/schema/product");
let orderSchema = require("../../sharedmb/schema/order");

let async = require("async");
let config = require("config");
let CronJob = require("cron").CronJob;
let crudModel = require("../../sharedmb/models/crud");

// new CronJob("0 34 19 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

let findAllOrders = () => {
    let condition = [
        {
            $lookup: {
                from: "sellers",
                localField: "sellerId",
                foreignField: "_id",
                as: "seller",
            },
        },
        {
            $unwind: {
                path: "$seller",
            },
        },
        {
            $addFields: {
                sellerInfo: {
                    sellerInformation: "$seller.sellerInformation",
                    invoiceAddress: "$seller.invoiceAddress",
                    shippingAddress: "$seller.shippingAddress",
                    returnAddress: "$seller.returnAddress",
                },
            },
        },
        {
            $project: {
                product: 1,
                sellerInfo: 1,
            },
        },
        {
            $unwind: {
                path: "$product",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "product.productId",
                foreignField: "_id",
                as: "productData",
            },
        },
        {
            $unwind: {
                path: "$productData",
            },
        },
        {
            $addFields: {
                product: {
                    productId: "$productData._id",
                    name: "$productData.name",
                    price: "$productData.price",
                    quantity: "$productData.quantity",
                    id: "$productData.id",
                    unit: "$productData.unit",
                    categoryId: "$productData.categoryId",
                    categories: "$productData.categories",
                    gst: "$productData.gst",
                    gstId: "$productData.gstId",
                    gstDesc: "$productData.gstDesc",
                    hsnCode: "$productData.hsnCode",
                    images: "$productData.images",
                    membershipPrice: "$productData.membershipPrice",
                    brandId: "$productData.brandId",
                    subBrandId: "$productData.subBrandId",
                    sku: "$productData.sku",
                    // 'mbSku': '$productData.mbSku',
                    skuDescription: "$productData.skuDescription",
                    sellPrice: "$productData.sellPrice",
                    recommendedAttribute: "$productData.recommendedAttribute",
                    addmore: "$productData.addmore",
                    barCode: "$productData.barCode",
                    productFamilyId: "$productData.productFamilyId",
                },
            },
        },
        {
            $group: {
                _id: "$_id",
                products: {
                    $push: "$product",
                },
                sellerInfo: {
                    $first: "$sellerInfo",
                },
            },
        },
    ];
    crudModel.aggregation(condition, orderSchema, (err, orders) => {
        if (err) {
            console.log(err);
        } else if (orders && orders.length > 0) {
            updateOrder(orders);
        }
    });
};

let updateOrder = (orders) => {
    async.each(
        orders,
        (order, callback) => {
            let condition = {
                _id: order._id,
            };
            let update = {
                $set: {
                    product: order.products,
                    sellerInfo: order.sellerInfo,
                },
            };
            let Option = {};
            crudModel.updateOne(
                condition,
                update,
                Option,
                orderSchema,
                (err, updated) => {
                    if (err) {
                        callback({
                            error: true,
                            success: false,
                            message: "error occured in upadte price",
                        });
                    } else {
                        callback();
                    }
                }
            );
        },
        (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("all done");
            }
        }
    );
};

//findAllOrders();
