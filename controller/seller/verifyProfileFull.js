var vendorSchema = require("../../sharedmb/schema/seller"),
    vendorModel = require("../../sharedmb/models/crud"),
    validate = require("express-validation"),
    validation = require("./validation");

module.exports =
    // validate(validation.sellerId),
    (req, res) => {
        let conditions = {
            _id: req.body.sellerId,
        };
        let update = {
            $set: {
                isProfileVerify: req.body.isProfileVerify,
                isVerify: req.body.isVerify,
            },
        };
        vendorModel.updateOne(
            conditions,
            update,
            {},
            vendorSchema,
            (error, response) => {
                if (error)
                    return res.status(400).json({
                        message: "error occurred",
                        error: error,
                        success: false,
                    });
                else if (response.nModified == 1)
                    return res.status(200).json({
                        message: "updated successfully",
                        success: true,
                    });
                else if (response.nModified == 0)
                    return res
                        .status(201)
                        .json({ message: "already verified", success: false });
                else
                    return res.status(201).json({
                        message: "unknown error occurred",
                        success: false,
                    });
            }
        );
    };
