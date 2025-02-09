let crud = require("../../sharedmb/models/crud"),
    schema = require("../../sharedmb/schema/adminRole"),
    admin = require("../../sharedmb/schema/admin"),
    acl = require("../myModule/aclModule");

let findAndUpdaterole = (req, res, next) => {
    crud.findOneAndUpdate(
        { _id: req.query.roleId, isDeleted: false },
        { $set: { isDeleted: true, updated: new Date().getTime() } },
        {},
        schema,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in findadminRoleList",
                    err,
                });
            }
            if (updated) {
                req.data = {};
                req.data.role = updated;
                next();
            } else
                return res
                    .status(201)
                    .json({ success: false, message: "already removed" });
        }
    );
};

let updateUserRoleAdmin = (req, res, next) => {
    crud.updateMany(
        { roleId: req.data.role._id },
        {
            roleId: null,
            updated: new Date().getTime(),
        },
        {},
        admin,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in updateUserRoleAdmin",
                    err,
                });
            } else {
                next();
            }
        }
    );
};

let removeRole = (req, res) => {
    let role = req.data.role;
    acl.removeRole(role.name, (err, userrole) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in removeRole",
                err,
            });
        }
        return res
            .status(200)
            .json({ success: true, message: " removeRole  successfully" });
    });
};

module.exports = [findAndUpdaterole, updateUserRoleAdmin, removeRole];
