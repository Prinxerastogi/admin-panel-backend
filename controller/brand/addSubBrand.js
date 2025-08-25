"use strict";

let crudModel = require("../../sharedmb/models/crud");
let brandSchema = require("../../sharedmb/schema/brand");
let utility = require("../../sharedmb/utility/utility");
let config = require("config");
let async = require("async");
let fs = require("fs-extra");
let MESSAGE = require("./message");

// let createSubBarnd = (req, res, next) => {
// let data = {
//     name: req.body.name,
//     _name: utility.removeSpecialCharAndDash(req.body.name),
//     lName: req.body.name,
//     image: req.body.image,
//     tags: req.body.tags,
//     isRootBrand: false,
//     parentId: req.body.parentBrandId,
//     childIds: [],
//     description: req.body.description,
//     lDescription: req.body.description,
//     updated: new Date().getTime(),
//     created: new Date().getTime(),
//     date: new Date(),
// };
//     crudModel.create(data, brandSchema, (err, response) => {
//         if (err) {
//             return res.status(400).json({
//                 error: true,
//                 message: MESSAGE.add.errornewbrand,
//                 success: false,
//                 error: err,
//             });
//         } else {
//             req.data = {};
//             req.data.childBarndsId = response._id;
//             req.data.id = response.id;
//             next();
//         }
//     });
// };
let createSubBarnd = async (req, res, next) => {
  try {
    let data = {
      name: req.body.name,
      _name: utility.removeSpecialCharAndDash(req.body.name),
      lName: req.body.name,
      image: req.body.image,
      tags: req.body.tags,
      isRootBrand: false,
      parentId: req.body.parentBrandId,
      childIds: [],
      description: req.body.description,
      lDescription: req.body.description,
      updated: new Date().getTime(),
      created: new Date().getTime(),
      date: new Date(),
    };

    let response = await Brand.create(data);

    req.data = {
      childBarndsId: response._id,
      id: response.id,
    };
    next();
  } catch (err) {
    return res.status(400).json({
      error: true,
      message: MESSAGE.add.errornewbrand,
      success: false,
      error: err.message || err,
    });
  }
};

let copybrandImage = (req, res, next) => {
  if (req.body.image) {
    req.body.image = [req.body.image];
    let dstPath = `${config.upload.brandImagePath}${req.data.id}/`;
    async.each(
      req.body.image,
      function (image, callback) {
        fs.ensureDir(dstPath, (err) => {
          let srcPath = config.upload.tempPath + image;
          let dstFilePath = dstPath + image;
          fs.move(srcPath, dstFilePath, (err) => {
            if (err) {
              callback({
                error: true,
                success: false,
                message: "message.product.add.error.message",
                err,
              });
            } else {
              console.log("success!");
              callback();
            }
          });
        });
      },
      function (err) {
        if (err) {
          return res.status(400).json({
            error: true,
            success: false,
            message: "message.product.add.error.message",
            err,
          });
        } else {
          console.log(MESSAGE.add.processed);
          next();
        }
      }
    );
  } else {
    next();
  }
};

let findParentBarndAndUpdateChilds = (req, res) => {
  let condition = {
      _id: req.body.parentBrandId,
    },
    update = {
      $push: {
        childIds: req.data.childBarndsId,
      },
    },
    Option = {};
  crudModel.updateOne(
    condition,
    update,
    Option,
    brandSchema,
    (err, updateMany) => {
      if (err) {
        return 0;
      } else if (updateMany.modifiedCount > 0 && updateMany.n > 0) {
        return res
          .status(200)
          .json({ success: true, message: MESSAGE.add.added });
      } else {
        return res.status(201).json({
          success: false,
          message: "Failed to update childId in brand",
        });
      }
    }
  );
};

module.exports = [
  createSubBarnd,
  copybrandImage,
  findParentBarndAndUpdateChilds,
];
