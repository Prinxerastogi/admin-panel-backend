"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  societySchema = require("../../sharedmb/schema/society"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

let addFlat = (req, res) => {
  let condition = {
    _id: req.body.societyId,
    block: req.body.blockName,
  };
  let update = {
    $addToSet: {
      "flat.$.flatNo": req.body.flatNo,
    },
  };
  let options = {};
  crudModel.updateOne(
    condition,
    update,
    options,
    societySchema,
    (error, response) => {
      if (error)
        return res.status(400).json({
          error: error,
          success: false,
          message: MESSAGE.addFlat.error,
        });
      else if (response.modifiedCount == 1)
        return res
          .status(200)
          .json({ success: true, message: MESSAGE.addflat.added });
      else
        return res
          .status(201)
          .json({ success: false, message: MESSAGE.addflat.saved });
    }
  );
};

module.exports = [validate(validation.addFlat), addFlat];
