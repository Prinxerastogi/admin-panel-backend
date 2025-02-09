let productSchema = require("../../sharedmb/schema/product");
let async = require("async");
let request = require("axios");
let CronJob = require("cron").CronJob;

new CronJob(
    "0 0 12,18 * * *",
    function () {
        console.log("Cron Job started for grofers price comparison");
        findGrofersProduct();
    },
    null,
    true,
    "Asia/Kolkata"
);

let findGrofersProduct = () => {
    let condition = {
        "competitor.grofers.merchantId": { $ne: null },
        "competitor.grofers.productId": { $ne: null },
    };
    productSchema.find(condition, (err, response) => {
        let grofers = response.map((_) => {
            return {
                MBProductId: _._id,
                grofersProductId: _.competitor.grofers.productId,
                merchantId: _.competitor.grofers.merchantId,
                sellPriceMB: _.sellPrice,
                minSellPriceMB: _.minSellPrice,
            };
        });
        if (grofers.length > 0) {
            console.log("products matching with grofers " + grofers.length);
            async.mapSeries(
                grofers,
                (product, cb) => {
                    let url = `https://grofers.com/v6/merchant/${product.merchantId}/product/${product.grofersProductId}/`;
                    request({
                        method: "get",
                        url: url,
                    })
                        .then(function (response) {
                            console.log(
                                product.MBProductId,
                                product.minSellPriceMB,
                                product.sellPriceMB,
                                response.data.data.product.price
                            );
                            if (
                                response.data &&
                                response.data.data.product.price &&
                                product.minSellPriceMB
                            ) {
                                let condition = {
                                    _id: product.MBProductId,
                                };
                                let update;
                                if (
                                    product.sellPriceMB >
                                    response.data.data.product.price
                                ) {
                                    update = {
                                        $set: {
                                            sellPrice:
                                                product.minSellPriceMB <
                                                response.data.data.product.price
                                                    ? response.data.data.product
                                                          .price
                                                    : product.minSellPriceMB,
                                            "competitor.grofers.lastPrice":
                                                response.data.data.product
                                                    .price,
                                        },
                                    };
                                } else {
                                    update = {
                                        $set: {
                                            "competitor.grofers.lastPrice":
                                                response.data.data.product
                                                    .price,
                                        },
                                    };
                                }
                                productSchema.updateOne(
                                    condition,
                                    update,
                                    (err, response) => {}
                                );
                            }
                            cb();
                        })
                        .catch(function (error) {
                            // console.log(error.response.data);
                            cb();
                        });
                },
                function (err, results) {
                    console.log(
                        "cornjob for grofers price comparison completed"
                    );
                }
            );
        }
    });
};
