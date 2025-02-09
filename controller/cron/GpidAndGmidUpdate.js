const csvFilePath =
    "/home/saurabh/Desktop/morningBag/productfile/salman/new2 - new2.csv";
let productSchema = require("../../sharedmb/schema/product");
let crudModel = require("../../sharedmb/models/crud");
const csv = require("csvtojson");
const async = require("async");
let CronJob = require("cron").CronJob;

// new CronJob("01 52 19 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

let findAllproducts = () => {
    csv()
        .fromFile(csvFilePath)
        .then((products) => {
            async.each(
                products,
                function (product, callback) {
                    let condition = {
                        id: Number(product.id),
                    };
                    let update = {
                        $set: {
                            gpId:
                                product.gpId.length > 0
                                    ? Number(product.gpId)
                                    : null,
                            gmId:
                                product.gmId.length > 0
                                    ? Number(product.gmId)
                                    : null,
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
                function (err) {
                    // if any of the file processing produced an error, err would equal that error
                    if (err) {
                        console.log("A product failed to process");
                    } else {
                        console.log(
                            "All products have been processed successfully"
                        );
                    }
                }
            );
        });
};
