"use strict";
let schema = require("../../sharedmb/schema/admin"),
  crud = require("../../sharedmb/models/crud"),
  mongoose = require("mongoose"),
  acl = require("../myModule/aclModule");

// let findAdmin = (req, res, next) => {
//     let condition = [
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId(req.query.adminId)
//             }
//         },
//         {
//             $lookup: {
//                 from: 'roles',
//                 localField: 'roleId',
//                 foreignField: '_id',
//                 as: 'role'
//             }
//         },
//         {
//             $unwind: {
//                 path: '$role'
//             }
//         }
//     ]

//     crud.aggregation(condition, schema, (err, admin) => {
//         if (err) {
//             return res.status(400).json({ success: false, message: 'error occured in addUserRole', err });
//         }
//         else {
//             req.data = {};
//             req.data.admin = admin[0];
//             next();
//         }
//     })
// };

// let removeUserRoles = (req, res, next) => {
//     let role = req.body.role;
//     acl.removeUserRoles(req.data.admin._id, req.data.admin.role.name, (err, removerole) => {
//         if (err) {
//             return res.status(400).json({ success: false, message: 'error occured in addUserRole', err });
//         }
//         next();
//     });
// };

let updateAdmin = (req, res) => {
  crud.updateOne(
    { _id: req.query.adminId },
    {
      $set: {
        isDeleted: true,
        roleId: null,
        updated: new Date().getTime(),
      },
    },
    {},
    schema,
    (err, updated) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error occured in addUserRole",
          err,
        });
      } else {
        return res
          .status(200)
          .json({ success: true, message: "admin removed" });
      }
    }
  );
};

module.exports = [
  // findAdmin,
  // removeUserRoles,
  updateAdmin,
];
