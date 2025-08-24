let orderSchema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");
module.exports = [
  async (req, res) => {
    // Extract start and end date from req.body
    let { startDate, endDate } = req.query;
    const sellerId = req.query.sellerId || null;

    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // Ensure proper formatting of dates
    if (!startDate && !endDate) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Construct aggregation pipeline
    const pipeline = mongoose.isValidObjectId(sellerId)
      ? [
          {
            $match: {
              sellerId: new mongoose.Types.ObjectId(req.decoded.id),
            },
          },
        ]
      : [];
    pipeline.push(
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: endDateObj,
          },
        },
      },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      }
    );
    console.log(pipeline);
    crud.aggregation(pipeline, orderSchema, (err, users) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Error occurred in user search", err });
      } else if (users && users.length > 0) {
        return res.status(200).json({
          success: true,
          message: "User list found",
          users: users,
        });
      } else {
        return res
          .status(201)
          .json({ success: false, message: "User list not found" });
      }
    });
  },
];
