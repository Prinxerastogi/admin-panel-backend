let sellerSchema = require("../../sharedmb/schema/seller");
let mongoose = require("mongoose");

let setCity = (req, res) => {
  let condition = {
    _id: req.body.sellerId,
  };
  console.log(req.body.cityIds);
  let update = {
    $set: {
      cities: req.body.cityIds.map((_) => {
        return new mongoose.Types.ObjectId(_);
      }),
    },
  };
  sellerSchema.updateOne(condition, update, (err, response) => {
    if (err) {
      return res.status(400).json({
        message: "error occurred",
        error: err,
        success: false,
      });
    } else if (response.nModified > 0) {
      return res.status(200).json({ message: "city added", success: true });
    } else {
      return res
        .status(201)
        .json({ message: "city already added", success: false });
    }
  });
};

module.exports = [setCity];
