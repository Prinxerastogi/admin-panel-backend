"use strict";
const { Types } = require("mongoose");
let orderSchema = require("../../sharedmb/schema/order");

let findOrders = async (req, res) => {
    try {
        let condition = {
            offerId: Types.ObjectId(req.query.offerId),
        };
        const orders = await orderSchema.aggregate([
            {
                $match: condition,
            },
            {
                $sort: {
                    id: -1,
                },
            },
            {
                $project: {
                    id: 1,
                    userId: 1,
                    created: 1,
                    date: 1,
                    amount: 1,
                    couponDiscount: 1,
                    promocode: 1,
                    status: 1,
                },
            },
        ]);
        if (orders.length > 0) {
            return res
                .status(200)
                .json({ success: true, message: "Order List found", orders }); // Send the orders back to the client
        }
        return res
            .status(202)
            .json({ success: true, message: "No Orders found" }); // Send the orders back to the client
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while fetching orders.",
        });
    }
};

module.exports = [findOrders];
