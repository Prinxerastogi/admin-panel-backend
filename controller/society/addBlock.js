"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  societySchema = require("../../sharedmb/schema/society"),
  validate = require("express-validation"),
  validation = require("./validation"),
  MESSAGE = require("./message");

let addBlock = (req, res) => {
  let condition = {
    _id: req.body.societyId,
    block: { $nin: [req.body.blockName.toLowerCase()] },
  };
  let update = {
    $push: {
      block: req.body.blockName.toLowerCase(),
      flat: {
        blockName: req.body.blockName.toLowerCase(),
        totalFlat: Number(req.body.noOfFlat),
      },
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
          message: MESSAGE.addblock.error,
        });
      else if (response.modifiedCount == 1)
        return res
          .status(200)
          .json({ success: true, message: MESSAGE.addblock.added });
      else
        return res
          .status(201)
          .json({ success: false, message: MESSAGE.addblock.failed });
    }
  );
};

module.exports = [validate(validation.addBlock), addBlock];
