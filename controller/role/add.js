let crud = require("../../sharedmb/models/crud"),
    schema = require("../../sharedmb/schema/adminRole"),
    acl = require("../myModule/aclModule"),
    adminSchema = require("../../sharedmb/schema/admin");

let findRole = (req, res, next) => {
    crud.findOne(
        { name: req.body.userRole, isDeleted: false },
        schema,
        (err, role) => {
            if (err)
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in findadminRole",
                    err,
                });
            if (role)
                return res.status(201).json({
                    success: false,
                    message: "this role is already added in the system",
                    role,
                });
            if (role == null) {
                next();
            } else
                return res.status(201).json({
                    success: false,
                    message: "unexpected result found",
                });
        }
    );
};

let assignRole = (req, res, next) => {
    console.log(req.body);
    try {
        acl.addUserRoles(req.body.type, req.body.userRole, (err) => {
            console.log(err);
            // if (err) return res.status(400).json({ error: true, message: 'error occured in addUserRoles', err });
            next();
        });
    } catch (err) {
        console.log(err);
    }
};

let allowUser = (req, res, next) => {
    // let permission = req.body.permission.map((_) => {

    //         return {
    //             resources: _.resources, permissions: _.permissions
    //         }
    //     })
    acl.allow(
        [
            {
                roles: req.body.userRole,
                allows: req.body.permission,
            },
        ],
        (err, allow) => {
            // if (err) return res.status(400).json({ error: true, message: 'error occured in allowUser', err });
            next();
        }
    );
};

let saveRoleData = (req, res) => {
    const now = new Date().getTime();
    const data = {
        name: req.body.userRole,
        permission: req.body.permission,
        created: now,
        updated: now,
        type: req.body.type,
        date: new Date(),
    };
    crud.create(data, schema, (err, created) => {
        // if (err) return res.status(400).json({ error: true, success: false, message: 'error occured in saveRoleData', err });
        if (created) {
            crud.findByIdAndUpdate(
                req.body.userID,
                { roleId: created._id },
                {},
                adminSchema,
                (error, added) => {
                    if (error)
                        return res.status(400).json({
                            success: false,
                            message: "problem in adding role to user",
                        });
                }
            );
            return res.status(200).json({
                success: true,
                message: "role add successfully",
                role: created,
            });
        } else
            return res.status(201).json({
                success: false,
                message: "something went wrong in saveRoleData",
            });
    });
};

module.exports = [findRole, assignRole, allowUser, saveRoleData];
