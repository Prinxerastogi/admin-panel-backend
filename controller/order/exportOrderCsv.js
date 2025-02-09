let orderSchema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
const { createObjectCsvWriter } = require("csv-writer");
const fs = require("fs");
module.exports = [
    async (req, res) => {
        const { startDate, endDate, status } = req.query;

        let start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        let filter = {
            date: {
                $gte: start,
                $lte: end,
            },
        };

        if (status && status !== "all") {
            filter.status = status;
        }

        try {
            // Fetch orders between startDate and endDate with optional status filter
            // const orders = await collection.find(filter).toArray();
            crud.find(filter, orderSchema, async (err, orders) => {
                if (err) {
                    return res.status(400).json({
                        message: "Error occurred in fetching orders",
                        err,
                    });
                } else if (orders && orders.length > 0) {
                    // Convert orders to plain objects and transform the data
                    const cleanOrders = orders.map((order) => {
                        const orderObj = order.toObject();
                        // Combine line1 and line2 into a single column
                        orderObj.address = orderObj.address || {};
                        orderObj.combinedAddress = `${
                            orderObj.address.line1 || ""
                        } ${orderObj.address.line2 || ""}`.trim();
                        // Keep name and fullAddress in separate columns
                        orderObj.name = orderObj.address.name || "";
                        orderObj.mobileNo = orderObj.address.mobileNo;
                        orderObj.fullAddress =
                            orderObj.address.fullAddress || "";
                        // Remove the original address object if you don't want it in the CSV
                        delete orderObj.address;
                        return orderObj;
                    });

                    // Define the keys to be included in the CSV
                    const keys = [
                        "name",
                        "fullAddress",
                        "combinedAddress",
                        "mobileNo",
                        ...Object.keys(cleanOrders[0]).filter(
                            (key) =>
                                ![
                                    "name",
                                    "fullAddress",
                                    "combinedAddress",
                                    "mobileNo",
                                ].includes(key)
                        ),
                    ];

                    // Create CSV writer
                    const csvWriter = createObjectCsvWriter({
                        path: "orders.csv",
                        header: keys.map((key) => ({ id: key, title: key })),
                    });

                    // Write orders to CSV
                    await csvWriter.writeRecords(cleanOrders);

                    // Set response headers for CSV download
                    res.setHeader("Content-Type", "text/csv");
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=orders.csv"
                    );

                    // Stream the CSV file to the response
                    const stream = fs.createReadStream("orders.csv");
                    stream.pipe(res);
                } else {
                    A;
                    return res
                        .status(201)
                        .json({ success: false, message: "Order not found" });
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
];
