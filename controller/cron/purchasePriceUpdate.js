let productSchema = require("../../sharedmb/schema/product");
let async = require("async");
let config = require("config");
let CronJob = require("cron").CronJob;
let crudModel = require("../../sharedmb/models/crud");

// new CronJob("0 45 11 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

let findAllproducts = () => {
    crudModel.aggregation({}, productSchema, (err, products) => {
        if (err) {
            console.log(err);
        } else if (products && products.length > 0) {
            updatePurchasePrice(products);
        }
    });
};

let updatePurchasePrice = (products) => {
    async.each(
        products,
        (product, callback) => {
            let condition = {
                _id: product._id,
            };
            let update = {
                $set: {
                    // purchasePrice: Number(product.price) - ((Number(product.price) - Number(product.sellPrice)) * 2)
                    sellPrice: Number(product.purchasePrice),
                },
            };
            let Option = {};
            crudModel.updateOne(
                condition,
                update,
                Option,
                productSchema,
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
