const { mongo, default: mongoose } = require("mongoose");

const buttonActions = {
  showLast3Orders: async (req, res) => {
    let currentUser = req.decoded;
    let userId = currentUser.id;
    console.log("userId", userId);
    let condition = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          amount: 1,
          date: 1,
          id: 1,
          numOfItems: {
            $size: "$product",
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 3,
      },
    ];
    crudModel.aggregation(condition, ticketSchema, (err, order) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "error occured in find ticketList",
          error: err,
        });
      }
      if (order && order.length > 0) {
        return res.status(200).json({
          success: true,
          message: ` ${order.length} tickets found`,
          tickets: order,
        });
      } else {
        return res
          .status(201)
          .json({ success: false, message: "order  not found" });
      }
    });
  },
  raiseExchangeRequest: async (req, res) => {},
  raiseMissingRequest: async (req, res) => {},
  raiseTechnicalIssue: async (req, res) => {},
};
