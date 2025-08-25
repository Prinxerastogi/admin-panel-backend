let serveAreaSchema = require("../../../sharedmb/schema/servingArea");
let mongoose = require("mongoose");
let validation = require("./validation");
let validate = require("express-validation");

let findServeArea = (req, res, next) => {
  let condition = [
    {
      $match: {
        cityId: new mongoose.Types.ObjectId(req.body.cityId),
      },
    },
  ];
  serveAreaSchema.aggregate(condition, (err, response) => {
    if (err) {
      res.status(400).json({ err: true, message: err.message });
    } else {
      req.data = {};
      if (response.length > 0) {
        req.data.serveArea = response[0];
      }
      next();
    }
  });
};

let updateServeAreaInCity = (req, res, next) => {
  if (req.data.serveArea) {
    let data = {
      $push: {
        servingAreas: {
          area: req.body.area,
          areaName: req.body.areaName,
        },
      },
      updated: new Date(),
    };
    serveAreaSchema.updateOne(
      { cityId: new mongoose.Types.ObjectId(req.body.cityId) },
      data,
      (err, response) => {
        if (err) {
          res.status(400).json({ err: true, message: err.message });
        } else if (response.modifiedCount > 0) {
          res.status(200).send({
            success: true,
            message: "serve area updated successfully",
          });
        } else {
          res.status(200).send({
            success: false,
            message: "unable to update serve area",
          });
        }
      }
    );
  } else {
    next();
  }
};

let addServeAreaInCity = (req, res) => {
  let serveArea = {
    servingAreas: [
      {
        area: req.body.area,
        areaName: req.body.areaName,
      },
    ],
    crated: new Date(),
    updated: new Date(),
    cityId: req.body.cityId,
    areaName: req.body.areaName,
  };

  serveAreaSchema.create(serveArea, (err, data) => {
    if (err) {
      res.status(400).json({ err: true, message: err.message });
    } else if (data) {
      res.status(200).json({
        success: true,
        message: "Serve area added successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "unable to add serve area",
      });
    }
  });
};

module.exports = [
  validate(validation.cityId),
  findServeArea,
  updateServeAreaInCity,
  addServeAreaInCity,
];
