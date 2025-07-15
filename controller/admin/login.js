"use strict";
let loginSchema = require("../../sharedmb/schema/admin"),
    loginModel = require("../../sharedmb/models/crud"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    jwt = require("jsonwebtoken"),
    MESSAGE = require("./message");

module.exports = (req, res) => {
    let conditions = {
        email: req.body.email,
        isDeleted: false,
    };
    loginModel.findOne(conditions, loginSchema, (error, response) => {
        if (error) res.status(400).json({ message: error });
        else if (response != null) {
            utility.checkHashPassword(
                req.body.password,
                response.password,
                (error, isPasswordMatch) => {
                    if (isPasswordMatch) {
                        const payload = {
                            id: response._id,
                            email: response.email,
                        };
                        let token = jwt.sign(payload, process.env.ADMIN_JWT_SECRET_KEY, {
                            // expiresIn: config.tokenValidity.day,
                        });
                        response.token = token;

                        return res.status(200).json({
                            success: true,
                            message: MESSAGE.login.logged,
                            token: token,
                            permissions: response.permissions,
                        });
                    } else
                        res.status(201).json({
                            message: MESSAGE.login.notfound,
                        });
                }
            );
        } else res.status(201).json({ message: MESSAGE.login.usernot });
    });
};
