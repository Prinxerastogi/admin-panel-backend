// 'use strict';

let acl = require("../myModule/aclModule");
let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/admin");
let mongoose = require("mongoose");
let config = require("config");

let findUser = (req, res, next) => {
  crud.aggregation(
    [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.decoded.id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: config.collections.adminroles,
          localField: "roleId",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: {
          path: "$role",
        },
      },
      {
        $match: {
          "role.isDeleted": false,
        },
      },
    ],
    schema,
    (err, admin) => {
      if (err)
        return res.status(400).json({
          error: true,
          message: "error occured in find user",
          err,
        });
      if (admin && admin.length > 0) {
        req.data = {};
        req.data.admin = admin[0];
        next();
      } else {
        return res.status(201).json({
          success: false,
          message: "please assign role or permission to the user",
        });
      }
    }
  );
};

let checkPermission = (req, res, next) => {
  let url = req.url.split("?")[0];

  const matchingResource = req.data.admin.role.permission.find((permission) => {
    if (permission.resources === "*") return true;
    return (
      permission.resources === config.adminRoute + url &&
      permission.permissions.includes(req.method)
    );
  });
  if (matchingResource) {
    console.log("Authorization passed");
    next();
  } else {
    console.log("Authorization failed");
    res.status(201).json({
      succes: false,
      message: "Insufficient permissions to access resource",
    });
  }
};

module.exports = [findUser, checkPermission];
