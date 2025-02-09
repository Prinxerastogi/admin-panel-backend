var sellerSchema = require("../../sharedmb/schema/seller");
var crudModel = require("../../sharedmb/models/crud");
let validate = require("express-validation");
let validation = require("./validation");
let MESSAGE = require("./message");

module.exports = [
    validate(validation.sellerId),
    (req, res) => {
        let condition = { _id: req.body.sellerId };
        let update = {
            $set: {
                isActivate: req.body.isActivate,
            },
        };
        let Option = {};
        crudModel.updateOne(
            condition,
            update,
            Option,
            sellerSchema,
            (err, updated) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: MESSAGE.activateDeactivate.error,
                        error: err,
                    });
                } else if (updated && updated.nModified > 0 && updated.n > 0) {
                    return res.status(200).json({
                        success: true,
                        message: MESSAGE.activateDeactivate.status,
                    });
                } else {
                    return res.status(201).json({
                        success: false,
                        message: MESSAGE.activateDeactivate.already,
                    });
                }
            }
        );
    },
];
