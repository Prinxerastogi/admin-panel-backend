let serveAreaSchema = require("../../../sharedmb/schema/servingArea");
let sellerSchema = require("../../../sharedmb/schema/seller");
let mongoose = require("mongoose");

let findSellers = (req, res, next) => {
  let condition = [
    {
      $unwind: {
        path: "$serveAreas",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        serveAreas: new mongoose.Types.ObjectId(req.params.id),
      },
    },
  ];

  req.data = {};
  sellerSchema.aggregate(condition, (err, response) => {
    if (err) {
      return res.status(400).json({ err: true, message: err.message });
    } else if (response.length > 0) {
      req.data.sellerId = response[0]._id;
    }

    next();
  });
};

let removeSellerServeArea = (req, res, next) => {
  if (req.data.sellerId) {
    let condition = {
      _id: req.data.sellerId,
    };

    let payload = {
      $pull: {
        serveAreas: new mongoose.Types.ObjectId(req.params.id),
      },
    };

    sellerSchema.updateOne(condition, payload, (err, response) => {
      if (err) {
        return res.status(400).json({ err: true, message: err.message });
      } else if (response.nModified > 0) {
        next();
      } else {
        res.status(200).json({
          success: false,
          message: "unable to delete area",
        });
      }
    });
  } else {
    next();
  }
};

let deleteServeArea = (req, res) => {
  let condition = {
    "servingAreas._id": req.params.id,
  };

  let data = {
    $pull: {
      servingAreas: {
        _id: req.params.id,
      },
    },
  };

  serveAreaSchema.updateOne(condition, data, (err, deleteRes) => {
    if (err) {
      res.status(400).json({ err: true, message: err.message });
    } else if (deleteRes.nModified > 0) {
      res.status(200).send({
        success: true,
        message: "serve area deleted successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "unable to delete serve area",
      });
    }
  });
};

module.exports = [findSellers, removeSellerServeArea, deleteServeArea];
