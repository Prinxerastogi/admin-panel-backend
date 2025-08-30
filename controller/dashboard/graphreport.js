let crudModel = require("../../sharedmb/models/crud"),
  DailyStat = require("../../sharedmb/schema/DailyStat"),
  mongoose = require("mongoose"),
  validation = require("./validation"),
  MESSAGE = require("./message"),
  validate = require("express-validation");

module.exports = [
  async (req, res) => {
    let startDate;
    let endDate;
    let interval;
    let sellerId = req.body.sellerId || null;

    const { granularity } = req.query || "monthly";
    let precedingStartDate;
    let precedingEndDate;

    switch (granularity) {
      case "monthly":
        const today = new Date();
        startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // 11 months ago from the first day of the month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

        // Preceding time period
        precedingStartDate = new Date(
          today.getFullYear() - 1,
          today.getMonth() - 11,
          1
        ); // 12 months ago from the first day of the month
        precedingEndDate = new Date(
          today.getFullYear() - 1,
          today.getMonth() + 1,
          0
        ); // Last day of the preceding month
        break;
      case "weekly":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 70); // 10 weeks ago
        endDate = new Date();
        interval = "1 week";

        // Preceding time period
        precedingStartDate = new Date();
        precedingStartDate.setDate(precedingStartDate.getDate() - 140); // 20 weeks ago
        precedingEndDate = new Date();
        break;
      case "daily":
      default:
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 29); // 30 days ago
        endDate = new Date();
        interval = "1 day";

        // Preceding time period
        precedingStartDate = new Date();
        precedingStartDate.setDate(precedingStartDate.getDate() - 59); // 60 days ago
        precedingEndDate = new Date();
        break;
    }

    let pipeline = [];
    if (sellerId !== null) {
      pipeline.push({
        $match: {
          sellerId: new mongoose.Types.ObjectId(req.query.sellerId),
          date: { $gte: startDate, $lte: endDate }, // Current time period
        },
      });
    } else {
      pipeline.push({
        $match: {
          date: { $gte: startDate, $lte: endDate }, // Current time period
        },
      });
    }
    pipeline.push(
      {
        $group: {
          _id: {
            period:
              granularity === "weekly"
                ? { $week: "$date" }
                : {
                    $dateToString: {
                      format: granularity === "monthly" ? "%Y-%m" : "%Y-%m-%d",
                      date: "$date",
                    },
                  },
          },
          totalAmount: { $sum: "$totalAmount" },
          cancelledAmount: { $sum: "$cancelledAmount" },
          count: { $sum: "$orderCount" },
          startDate: { $first: "$date" },
          lastDate: { $last: "$date" },
        },
      },
      {
        $sort: { "_id.period": 1 }, // Sort by period
      }
    );
    try {
      // Aggregate daily stats based on the requested granularity
      const report = await DailyStat.aggregate(pipeline);

      const prevReport = await DailyStat.aggregate([
        {
          $match: {
            sellerId: new mongoose.Types.ObjectId(sellerId),
            date: {
              $gte: precedingStartDate,
              $lte: precedingEndDate,
            }, // Preceding time period
          },
        },
        {
          $group: {
            _id: {
              period:
                granularity === "weekly"
                  ? { $week: "$date" }
                  : {
                      $dateToString: {
                        format:
                          granularity === "monthly" ? "%Y-%m" : "%Y-%m-%d",
                        date: "$date",
                      },
                    },
            },
            totalAmount: { $sum: "$totalAmount" },
            cancelledAmount: { $sum: "$cancelledAmount" },
            count: { $sum: "$orderCount" },
            startDate: { $first: "$date" },
            lastDate: { $last: "$date" },
          },
        },
        {
          $sort: { "_id.period": 1 }, // Sort by period
        },
      ]);

      res.status(200).json({ report, prevReport });
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },
];
