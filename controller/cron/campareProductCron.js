let compareProductSchema = require("../../sharedmb/schema/compareProduct");
let productSchema = require("../../sharedmb/schema/product");
let request = require("needle");
let async = require("async");
let config = require("config");
let CronJob = require("cron").CronJob;
let CronSchema = require("../../sharedmb/schema/cron");
let crudModel = require("../../sharedmb/models/crud");

// new CronJob("01 59 20 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

let findAllproducts = () => {
    crudModel.find(
        {
            gpId: {
                $ne: null,
            },
            gmId: {
                $ne: null,
            },
        },
        productSchema,
        (err, products) => {
            if (err) {
                console.log("error accured in find products", err);
            }
            if (products && products.length > 0) {
                findproductsId(products);
            } else {
                saveCronJobResponse({ message: "no product found" });
                console.log("no product found");
                return 1;
            }
        }
    );
};

let findproductsId = (products) => {
    let options = {
        method: "POST",
        uri: `http://localhost:${config.port}/api/admin/compare/product`,
        body: {
            date: new Date().setHours(12, 0, 0, 0),
        },
        json: true,
    };
    async.mapSeries(
        products,
        (product, cb) => {
            (options.body.productId = product._id),
                (options.body.token = config.cron.token),
                (options.body.product = product),
                request(options.method, options.uri, options.body, {
                    json: true,
                })
                    .then(function (response) {
                        // cb(null, response.body)
                        setTimeout(function () {
                            cb(null, response.body);
                        }, 1 /*30000*/);
                    })
                    .catch(function (err) {
                        cb(null, err);
                    });
        },
        function (err, results) {
            console.log(results);
            return saveCronJobResponse(results);
        }
    );
};

let saveCronJobResponse = (results) => {
    let data = {};
    data["products"] = results;
    data["created"] = new Date().getTime();
    data["updated"] = new Date().getTime();
    data["cronName"] = "compareProductCron";
    crudModel.insertMany(data, {}, CronSchema, function (err, data) {
        if (err) {
            console.log("error in saveCronJobResponse", err);
        } else {
            console.log("data saved successfully");
        }
    });
};

// https://grofers.com/v6/merchant/28738/product/15907/  -groffers  Get
//https://www.milkbasket.com/products/get    --milkBasket POst
