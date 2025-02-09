// Import necessary modules
const mongoose = require("mongoose");
const Order = require("../../sharedmb/schema/order");
const userSchema = require("../../sharedmb/schema/user");
const OrderCount = require("../../sharedmb/schema/DailyStat");

module.exports = [
    async (req, res) => {
        try {
            const fromDate = req.query.from
                ? new Date(req.query.from)
                : new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
            const toDate = req.query.to ? new Date(req.query.to) : new Date();

            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);

            // Query to fetch orders between the given date range and group them by date
            const orders = await Order.aggregate([
                {
                    $match: {
                        date: { $gte: fromDate, $lte: toDate },
                    },
                },
                {
                    $addFields: {
                        adjustedDate: {
                            $add: ["$date", 19800000], // 5 hours 30 minutes in milliseconds
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$adjustedDate",
                                },
                            },
                            sellerId: "$sellerId",
                        },
                        totalAmount: { $sum: "$amount" }, // Calculate sum of 'amount' for each day
                        cancelledAmount: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "cancelled"] }, // Check if status is "cancelled"
                                    "$amount", // If true, include amount
                                    0, // If false, include 0
                                ],
                            },
                        },
                        count: { $sum: 1 }, // Count orders for each day
                        cancelledOrderCount: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "cancelled"] }, // Check if status is "cancelled"
                                    1, // If true, include amount
                                    0, // If false, include 0
                                ],
                            },
                        },
                        grossProfit: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$status", "cancelled"] },
                                    0,
                                    "$grossProfit",
                                ],
                            },
                        },
                        deliveryCharge: { $sum: "$deliveryCharge" },
                        firstTimeUserCount: {
                            $sum: {
                                $cond: [{ $eq: ["$nthOrder", 1] }, 1, 0],
                            },
                        },
                        SecondTimeUserCount: {
                            $sum: {
                                $cond: [{ $eq: ["$nthOrder", 2] }, 1, 0],
                            },
                        },
                        ThirdTimeUserCount: {
                            $sum: {
                                $cond: [{ $eq: ["$nthOrder", 3] }, 1, 0],
                            },
                        },
                        ReturningUserCount: {
                            $sum: {
                                $cond: [{ $gt: ["$nthOrder", 3] }, 1, 0],
                            },
                        },
                        dwarkaOrders: {
                            $sum: {
                                $cond: [
                                    {
                                        $in: [
                                            "$address.fullAddress",
                                            [
                                                "110075",
                                                "110077",
                                                "110078",
                                                "110079",
                                                "110045",
                                            ],
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        outsideOrders: {
                            $sum: {
                                $cond: [
                                    {
                                        $in: [
                                            "$address.fullAddress",
                                            [
                                                "110075",
                                                "110077",
                                                "110078",
                                                "110079",
                                                "110045",
                                            ],
                                        ],
                                    },
                                    0,
                                    1,
                                ],
                            },
                        },
                    },
                },
                {
                    $sort: { _id: 1 }, // Sort by _id in ascending order
                },
            ]);

            const noOfUserRegistered = await userSchema.aggregate([
                {
                    $match: {
                        created: {
                            $gte: fromDate.getTime(),
                            $lte: toDate.getTime(),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date",
                            },
                        },
                        userCount: { $sum: 1 },
                    },
                },
            ]);

            // console.log("noOfUserRegistered", noOfUserRegistered);
            // console.log("orders", orders);

            const orderStats = orders.map((order) => ({
                sellerId: order._id.sellerId,
                date: new Date(order._id.date), // Use the date extracted from the aggregation result
                totalAmount: order.totalAmount,
                orderCount: order.count - order.cancelledOrderCount,
                deliveryCharges: order.deliveryCharge,
                cancelledOrderCount: order.cancelledOrderCount,
                cancelledAmount: order.cancelledAmount,
                firstTimeUserCount: order.firstTimeUserCount,
                SecondTimeUserCount: order.SecondTimeUserCount,
                ThirdTimeUserCount: order.ThirdTimeUserCount,
                ReturningUserCount: order.ReturningUserCount,
                dwarkaOrders: order.dwarkaOrders,
                outsideOrders: order.outsideOrders,
                grossProfit: order.grossProfit,
            }));

            orderStats.forEach((stat) => {
                const userCount = noOfUserRegistered.find((user) => {
                    return user._id === stat.date.toISOString().split("T")[0];
                });
                stat.userRegistered = userCount ? userCount.userCount : 0;
            });

            const result = await OrderCount.bulkWrite(
                orderStats.map((stat) => ({
                    updateOne: {
                        filter: { date: stat.date }, // Match existing document by date
                        update: stat, // Update if found
                        upsert: true, // Create if it doesn't exist
                    },
                }))
            );
            res.status(200).json({
                success: true,
                message: "Orders fetched successfully and order count stored",
            });
        } catch (error) {
            console.error(
                "Error fetching orders and storing order count:",
                error
            );
            res.status(500).json({
                success: false,
                message: "Error fetching orders and storing order count",
                error: error,
            });
        }
    },
];
