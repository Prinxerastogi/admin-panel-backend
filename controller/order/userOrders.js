let schema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
  (req, res) => {
    let pagination = {
      page: Number(req.query.start),
      limit: Number(req.query.limit),
    };
    let condition = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.query.userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ];
    if (pagination.page >= 0 && pagination.limit) {
      condition.push(
        {
          $skip: pagination.page * pagination.limit,
        },
        {
          $limit: pagination.limit,
        }
      );
    }
    crud.aggregation(condition, schema, (err, orders) => {
      if (err)
        return res
          .status(400)
          .json({ message: "error occured in orderlist", err });
      else if (orders && orders.length > 0)
        return res.status(200).json({
          success: true,
          message: "list found",
          orders: orders,
        });
      return res
        .status(201)
        .json({ success: false, message: "order list  not found" });
    });
  },
];
