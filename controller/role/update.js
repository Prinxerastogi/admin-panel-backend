let crud = require("../../sharedmb/models/crud"),
    schema = require("../../sharedmb/schema/adminRole"),
    async = require("async"),
    acl = require("../myModule/aclModule");

let findRole = (req, res, next) => {
    req.data = {};
    crud.findOne(
        { _id: req.body.roleId, isDeleted: false },
        schema,
        (err, role) => {
            if (err)
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in findadminRole",
                    err,
                });
            if (role) {
                req.data.role = role;
                next();
            } else
                return res
                    .status(201)
                    .json({ success: false, message: "no role found" });
        }
    );
};

let removeRole = (req, res, next) => {
    let role = req.data.role;
    acl.removeRole(role.name, (err, userrole) => {
        if (Object.keys(err).length) {
            return res.status(400).json({
                success: false,
                message: "error occured in removeRole",
                err,
            });
        }
        next();
    });
};

let allowUser = (req, res, next) => {
    let role = req.data.role;
    acl.allow(
        [
            {
                roles: role.name,
                allows: req.body.permission,
            },
        ],
        (err, allow) => {
            if (Object.keys(err).length)
                return res.status(400).json({
                    error: true,
                    message: "error occured in allowUser",
                    err,
                });
            next();
        }
    );
};

let update = (req, res) => {
    const now = new Date().getTime();
    let update = {
        $set: {
            permission: req.body.permission,
            updated: now,
        },
    };

    crud.updateOne(
        { _id: req.body.roleId },
        update,
        {},
        schema,
        (err, created) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: "error occured in allowUser",
                    err,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: "role update successfully",
                });
            }
        }
    );
};
// let saveRoleData = (req, res) => {
//     const now = new Date().getTime();
//     async.each(req.body.permission, function (permission, callback) {
//         let update = {
//             $set: {
//                 permission: permission,
//                 updated: now

//             },

//         }

//         crud.updateOne({ _id: req.body.roleId }, update, {}, schema, (err, created) => {
//             if (err) {
//                 callback({
//                     error: true, success: false, message: "error occured in update permission", err
//                 });
//             } else {
//                 console.log('success!')
//                 callback();
//             }

//         })

//     },

//     function (err) {
//         if (err) {
//             return res.status(400).json({
//                 error: true,
//                 success: false,
//                 message: "error occured in update permission",
//                 err
//             });
//         } else {
//             return res.status(200).json({ success: true, message: 'role update successfully' });
//         }
//     });

// };

module.exports = [
    findRole,
    removeRole,
    allowUser,
    update,
    //saveRoleData
];
