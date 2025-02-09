"use strict";
let schema = require("../../sharedmb/schema/admin"),
    crud = require("../../sharedmb/models/crud");

let update = (req, res) => {
    // if (req.body.password) {
    //     return res.status(400).json({ success: true, message: `password can not be changed `, });
    // }

    delete req.body.password;
    req.body.updated = new Date().getTime();
    crud.updateOne(
        { _id: req.body.userId },
        {
            $set: req.body,
        },
        {},
        schema,
        (err, updated) => {
            if (err)
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "errror occured in  update",
                    err,
                });
            else if (updated.n > 0 && updated.nModified > 0) {
                return res
                    .status(200)
                    .json({ success: true, message: `update succcessfully` });
            } else {
                return res.status(201).json({
                    success: false,
                    message: "already update ",
                });
            }
        }
    );
};

module.exports = [update];
