let schema = require("../../sharedmb/schema/walletTransaction");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
  (req, res) => {
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
          includeArrayIndex: "index",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $unwind: {
          path: "$order",
          includeArrayIndex: "index",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ];
    crud.aggregation(condition, schema, (err, list) => {
      if (err) {
        return res.status(400).json({
          error: true,
          message: "error occured in isseus list",
          err,
        });
      } else if (list && list.length > 0) {
        return res.status(200).json({
          success: true,
          message: `${list.length} documents found`,
          list: list,
        });
      } else {
        return res
          .status(201)
          .json({ success: false, message: `no documents found` });
      }
    });
  },
];
