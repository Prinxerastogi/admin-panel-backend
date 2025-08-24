let chatSchema = require("../../sharedmb/schema/chat");
let mongoose = require("mongoose");

let chatDetail = (req, res, next) => {
  try {
    let condition = [
      {
        $match: {
          orderId: new mongoose.Types.ObjectId(req.params.orderId),
        },
      },
    ];

    chatSchema.aggregate(condition, (err, response) => {
      if (err) {
        res.status(400).json({ err: true, message: err.message });
      } else if (response.length > 0) {
        req.body.chat = response[0];
        next();
      } else {
        res.status(200).json({
          success: false,
          message: "chat detail not found",
        });
      }
    });
  } catch (err) {
    res.status(400).json({ err: true, message: err.message });
  }
};

let updateMsg = async (req, res) => {
  try {
    let condition = {
      orderId: new mongoose.Types.ObjectId(req.params.orderId),
    };

    let payload = {
      isNewMsg: false,
      updated: Date.now(),
    };

    let response = await chatSchema.updateOne(condition, payload);

    if (response.nModified > 0) {
      res.status(200).json({
        success: true,
        message: "chat detail found",
        data: req.body.chat,
      });
    } else {
      res.status(200).json({
        success: false,
        message: "chat detail not found",
      });
    }
  } catch (err) {
    res.status(400).json({ err: true, message: err.message });
  }
};

module.exports = [chatDetail, updateMsg];
