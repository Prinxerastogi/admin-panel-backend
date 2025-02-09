let orderSchema = require("../../sharedmb/schema/order");
let async = require("async");
let config = require("config");
let CronJob = require("cron").CronJob;
let crudModel = require("../../sharedmb/models/crud");

let findAllOrders = () => {
    crudModel.find(
        {
            "address.location": { $exists: false },
            "address.latitude": { $exists: false },
            "address.longitude": { $exists: false },
            "address.line1": { $exists: false },
        },
        orderSchema,
        (err, orders) => {
            if (err) {
                console.log(err);
            } else if (orders && orders.length > 0) {
                updateOderAddress(orders);
            } else {
                console.log("no order found");
            }
        }
    );
};

let updateOderAddress = (orders) => {
    async.each(
        orders,
        (order, callback) => {
            let condition = {
                _id: order._id,
            };

            let society = order.address.society ? order.address.society : "";
            let flatNo = order.address.flatNo ? order.address.flatNo : "";
            let blockNo = order.address.blockNo ? order.address.blockNo : "";

            let updateData = {
                mobileNo: order.address.mobileNo,
                name: order.address.name,
                area: society,
                street: "",
                city: order.address.city,
                country: "india",
                state: order.address.state,
                district: "noida",
                fullAddress:
                    society +
                    order.address.city +
                    order.address.state +
                    " india",
                latitude: 28.535517,
                longitude: 77.391029,
                line1: flatNo + blockNo,
                line2: society + order.address.city,
                locality: society,
                neighbourhood: "",
                route: society,
                type: "home",
                location: {
                    lat: 28.535517,
                    lng: 77.391029,
                },
            };

            let update = {
                $set: {
                    address: updateData,
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
