let sellerSchema = require("../../../sharedmb/schema/servingArea");
let mongoose = require("mongoose");

let findServeArea = (req, res) => {
  let condition = [
    {
      $match: {
        cityId: new mongoose.Types.ObjectId(req.params.id),
      },
    },
  ];
  sellerSchema.aggregate(condition, (err, response) => {
    if (err) {
      res.status(400).json({ err: true, message: err.message });
    } else if (response.length > 0) {
      res.status(200).send({
        success: true,
        message: "serve area found",
        data: response[0],
      });
    } else {
      res.status(200).json({
        success: false,
        message: "no serve area found",
      });
    }
  });
};

module.exports = [findServeArea];
