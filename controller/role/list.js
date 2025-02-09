let crud = require("../../sharedmb/models/crud"),
    schema = require("../../sharedmb/schema/adminRole");

module.exports = [
    (req, res) => {
        crud.find({ isDeleted: false }, schema, (err, roleList) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "error occured in findadminRoleList",
                    err,
                });
            }
            if (roleList && roleList.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: "role list found",
                    roleList: roleList,
                });
            } else
                return res
                    .status(201)
                    .json({ success: false, message: " No list found" });
        });
    },
];
