let sellerSchema = require("../../../sharedmb/schema/seller");
let serveAreaSchema = require("../../../sharedmb/schema/servingArea");
let validation = require("../validation");
let mongoose = require("mongoose");
validate = require("express-validation");

let checkServeArea = async (req, res, next) => {
  req.body.areaIds = req.body.areaIds.map((_) => {
    return new mongoose.Types.ObjectId(_);
  });
  let condition = [
    {
      $match: {
        serveAreas: {
          $in: req.body.areaIds,
        },
      },
    },
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(req.body.sellerId) },
      },
    },
  ];

  sellerSchema.aggregate(condition, (err, response) => {
    if (err) {
      return res.status(400).json({ err: err.message, err: true });
    }
    // else if (response.length > 1) {
    //     res.status(200).json({ success: false, message: 'please assign same city area' })
    // }
    else if (response.length > 0) {
      res.status(200).json({
        success: false,
        message: "area is already assigned to another seller",
      });
    } else {
      next();
    }
  });
};

let findCity = (req, res, next) => {
  let condition = [
    {
      $match: {
        "servingAreas._id": {
          $in: req.body.areaIds,
        },
      },
    },
  ];

  serveAreaSchema.aggregate(condition, (err, response) => {
    if (err) {
      return res.status(400).json({ err: true, message: err.message });
    } else if (response.length > 0) {
      req.body.cityIds = response.map((_) => {
        return _.cityId;
      });
      next();
    } else {
      res.status(200).json({
        success: false,
        message: "unable to find city",
      });
    }
  });
};

let assignServeArea = (req, res) => {
  let condition = {
    _id: req.body.sellerId,
  };

  let payload = {
    $set: {
      serveAreas: req.body.areaIds,
      cities: req.body.cityIds,
    },
  };
  sellerSchema.updateOne(condition, payload, (err, updateRes) => {
    if (err) {
      res.status(400).json({ err: true, message: err.message });
    } else if (updateRes.nModified > 0) {
      res.status(200).json({
        success: true,
        message: "serve area added successfully",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "unable to add serve area",
      });
    }
  });
};

module.exports = [
  validate(validation.assign),
  checkServeArea,
  findCity,
  assignServeArea,
];
