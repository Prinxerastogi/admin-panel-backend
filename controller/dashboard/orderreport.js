let orderSchema = require("../../sharedmb/schema/order"),
  mongoose = require("mongoose");

let fetchOrdersAndGroupByStatus = async (req, res) => {
  // Calculate start date (one week ago) and end date (today)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 10); // One week ago

  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  startDate.setMilliseconds(0);
  const endDate = new Date();
  const sellerId = req.query.sellerId || null;

  const pipeline = mongoose.isValidObjectId(sellerId)
    ? [
        {
          $match: {
            sellerId: new mongoose.Types.ObjectId(sellerId),
          },
        },
      ]
    : [];

  pipeline.push({
    $group: {
      _id: "$status", // Group by status
      count: { $sum: 1 }, // Count orders for each status
    },
  });

  try {
    // Aggregate orders between start date and end date, and group by status
    const ordersByStatus = await orderSchema.aggregate(pipeline);
    console.log("ordersByStatus", ordersByStatus);

    // Define an array of all possible status types
    const allStatusTypes = [
      "dispatched",
      "processed",
      "confirmed",
      "cancelled",
      "delivered",
      "pending",
    ];

    // Initialize an object to store counts
    const statusCounts = {};

    // Set counts for existing statuses
    ordersByStatus.forEach((status) => {
      statusCounts[status._id] = status.count;
    });

    // Set counts for missing statuses to 0
    allStatusTypes.forEach((statusType) => {
      if (!(statusType in statusCounts)) {
        statusCounts[statusType] = 0;
      }
    });

    // Convert status counts object to an array of objects
    const orderedCounts = allStatusTypes.map((statusType) => ({
      _id: statusType,
      count: statusCounts[statusType],
    }));

    // console.log(orderedCounts);

    return res.status(200).json({
      message: "order status fetched successfully",
      orderCount: orderedCounts,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

module.exports = [fetchOrdersAndGroupByStatus];
