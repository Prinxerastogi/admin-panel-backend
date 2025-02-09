"use strict";
let schema = require("../../sharedmb/schema/admin"),
    crud = require("../../sharedmb/models/crud"),
    utility = require("../../sharedmb/utility/utility"),
    config = require("config"),
    jwt = require("jsonwebtoken"),
    MESSAGE = require("./message");

let checkEmail = (req, res, next) => {
    if (utility.isEmail(req.body.email)) {
        next();
    } else {
        return res.status(201).json({
            success: false,
            message: "please input valid input",
            email: req.body.email,
        });
    }
};

let findUser = (req, res, next) => {
    crud.findOne(
        { email: req.body.email, isDeleted: false },
        schema,
        (err, admin) => {
            if (err)
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "errror occured in  findUser",
                    err,
                });
            else if (admin) {
                return res.status(201).json({
                    success: false,
                    message: "this email is already registerd with the system",
                    email: req.body.email,
                });
            } else if (admin == null) {
                next();
            } else {
                return res
                    .status(500)
                    .json({ success: false, message: "internal server Error" });
            }
        }
    );
};

let passwordGenerate = (req, res, next) => {
    utility.hash(req.body.password, (err, hash) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  passwordGenerate",
                err,
            });
        if (hash) {
            req.data = {};
            req.data.hash = hash;
            next();
        } else {
            return res.status(500).json({
                error: true,
                success: false,
                message: "something went wrong in passwordGenerate ",
            });
        }
    });
};

let createNewUser = (req, res) => {
    let data = req.body;
    data.password = req.data.hash;
    data.created = new Date().getTime();
    data.updated = new Date().getTime();
    data.email = data.email;
    data.date = new Date();
    data.roleId = data.roleId;
    crud.create(data, schema, (err, created) => {
        if (err)
            return res.status(400).json({
                error: true,
                success: false,
                message: "errror occured in  createNewUser",
                err,
            });
        else if (created) {
            return res.status(200).json({
                success: true,
                message: " new user create successfully ",
            });
        } else if (created == null) {
            return res.status(201).json({
                success: false,
                message: "user can not be create please try to after some time",
            });
        } else {
            return res
                .status(500)
                .json({ success: false, message: "internal server Error" });
        }
    });
};

module.exports = [checkEmail, findUser, passwordGenerate, createNewUser];
