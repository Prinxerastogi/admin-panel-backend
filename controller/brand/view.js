let crudModel = require("../../sharedmb/models/crud");
let brandSchema = require("../../sharedmb/schema/brand");
let validate = require("express-validation");
let validation = require("./validation");
let mongoose = require("mongoose");

module.exports = [
  validate(validation.view),
  (req, res) => {
    let condition = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.query.brandId),
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "childIds",
          foreignField: "_id",
          as: "subBrands",
        },
      },
    ];
    //let condition = { _id: req.query.brandId }
    crudModel.aggregation(condition, brandSchema, (err, brand) => {
      if (err) {
        return res.status(400).json({
          error: true,
          success: false,
          message: "error accured show barnd",
          error: err,
        });
      } else if (!brand) {
        return res
          .status(201)
          .json({ success: false, message: "no brand found" });
      } else {
        return res.status(200).json({
          success: true,
          message: `${brand.length}`,
          brand: brand[0],
        });
      }
    });
  },
];
