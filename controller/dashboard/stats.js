let DailyStat = require("../../sharedmb/schema/DailyStat"),
    mongoose = require("mongoose");
let deliveryboySchema = require("../../sharedmb/schema/deliveryBoy");

module.exports = [
    async (req, res) => {
        const startDate = req.query.startDate
            ? new Date(padDay(req.query.startDate))
            : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate
            ? new Date(padDay(req.query.endDate))
            : new Date();

        function padDay(dateString) {
            const parts = dateString.split("-");
            if (parts[2].length === 1) {
                parts[2] = "0" + parts[2];
            }
            return parts.join("-");
        }

        try {
            let report = await DailyStat.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate },
                        // sellerId: mongoose.Types.ObjectId(req.decoded.id),
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$totalAmount" },
                        orderCount: { $sum: "$orderCount" },
                        deliveryCharges: { $sum: "$deliveryCharges" },
                        cancelledOrderCount: { $sum: "$cancelledOrderCount" },
                        cancelledAmount: { $sum: "$cancelledAmount" },
                        firstTimeUserCount: { $sum: "$firstTimeUserCount" },
                        SecondTimeUserCount: { $sum: "$SecondTimeUserCount" },
                        ThirdTimeUserCount: { $sum: "$ThirdTimeUserCount" },
                        ReturningUserCount: { $sum: "$ReturningUserCount" },
                        dwarkaOrders: { $sum: "$dwarkaOrders" },
                        outsideOrders: { $sum: "$outsideOrders" },
                        userRegistered: { $sum: "$userRegistered" },
                        grossProfit: { $sum: "$grossProfit" },
                    },
                },
            ]);

            console.log("report", report[0]);

            const onlinedeliveryBoysCount = await deliveryboySchema.aggregate([
                {
                    $group: {
                        _id: "$status",
                        name: { $push: "$name" },
                        count: { $sum: 1 },
                    },
                },
            ]);

            report = report[0] || {
                totalAmount: 0,
                orderCount: 0,
                deliveryCharges: 0,
                cancelledOrderCount: 0,
                cancelledAmount: 0,
                firstTimeUserCount: 0,
                SecondTimeUserCount: 0,
                ThirdTimeUserCount: 0,
                ReturningUserCount: 0,
                dwarkaOrders: 0,
                outsideOrders: 0,
                userRegistered: 0,
            };
            report.grossSales = report.totalAmount - report.cancelledAmount;
            report.netSales = report.grossSales - report.deliveryCharges;
            report.AOV = Math.floor(report.grossSales / report.orderCount);

            res.status(200).json({
                report: {
                    ...report,
                    inDelivery: onlinedeliveryBoysCount.find(
                        (x) => x._id === "inDelivery"
                    )
                        ? onlinedeliveryBoysCount.find(
                              (x) => x._id === "inDelivery"
                          )
                        : 0,
                    online: onlinedeliveryBoysCount.find(
                        (x) => x._id === "online"
                    )
                        ? onlinedeliveryBoysCount.find(
                              (x) => x._id === "online"
                          )
                        : 0,
                    returning: onlinedeliveryBoysCount.find(
                        (x) => x._id === "returning"
                    )
                        ? onlinedeliveryBoysCount.find(
                              (x) => x._id === "returning"
                          )
                        : 0,
                    inRoute: onlinedeliveryBoysCount.find(
                        (x) => x._id === "inRoute"
                    )
                        ? onlinedeliveryBoysCount.find(
                              (x) => x._id === "inRoute"
                          )
                        : 0,
                },
            });
        } catch (error) {
            console.error("Error generating report:", error);
            throw error;
        }
    },
];
