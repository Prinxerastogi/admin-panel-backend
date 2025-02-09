let orderSchema = require("../../sharedmb/schema/order");
let async = require("async");
let config = require("config");
let CronJob = require("cron").CronJob;
let crudModel = require("../../sharedmb/models/crud");

let findAllOrders = () => {
    crudModel.find(
        {
            "deliveryDate.date": { $exists: true },
        },
        orderSchema,
        (err, orders) => {
            if (err) {
                console.log(err);
            } else if (orders && orders.length > 0) {
                updateOderDeliveryDate(orders);
            } else {
                console.log("no order found");
            }
        }
    );
};

let updateOderDeliveryDate = (orders) => {
    async.each(
        orders,
        (order, callback) => {
            let condition = {
                _id: order._id,
            };
            let update = {
                $set: {
                    deliveryDate: order.deliveryDate.date,
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
                            message: "error occured in update order",
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

//findAllOrders()
