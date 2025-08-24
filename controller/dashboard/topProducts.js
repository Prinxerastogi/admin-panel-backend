let schema = require("../../sharedmb/schema/user");
let orderSchema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");
module.exports = [
  (req, res) => {
    let startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : ((s = new Date()),
        s.setDate(1),
        s.setHours(0),
        s.setMinutes(0),
        s.setSeconds(0),
        s.setMilliseconds(0),
        s);
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    let conditions = [];

    if (req.query.sellerId !== null && req.query.sellerId !== "null") {
      conditions.push({
        $match: {
          sellerId: new mongoose.Types.ObjectId(req.query.sellerId),
          date: { $gte: startDate, $lte: endDate },
        },
      });
    } else {
      conditions.push({
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      });
    }
    conditions.push(
      { $unwind: "$product" },
      // Group by product_id and sum the quantities and sell prices
      {
        $group: {
          _id: "$product.hsnCode",
          name: { $last: "$product.name" },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$product.quantity" },
          totalPrice: {
            $sum: {
              $multiply: ["$product.quantity", "$product.sellPrice"],
            },
          },
        },
      },
      { $sort: { totalPrice: -1 } },
      { $limit: 10 }
    );
    console.log(conditions);
    crud.aggregation(conditions, orderSchema, (err, products) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Error occurred in user search", err });
      } else if (products && products.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Products list found",
          products: products,
        });
      } else {
        return res.status(201).json({
          success: false,
          message: "Products list not found",
        });
      }
    });
  },
];
