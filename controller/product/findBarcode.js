let productSchema = require("../../sharedmb/schema/product");
let productModel = require("../../sharedmb/models/crud");

module.exports = [
    (req, res) => {
        let condition = { barCode: req.body.barCode };
        productModel.findOne(condition, productSchema, (error, response) => {
            if (error) {
                res.status(400).json({ message: error, success: false });
            } else if (response != null) {
                res.status(200).json({
                    success: true,
                    message: "This BarCode already exists",
                    response: response,
                });
            } else {
                res.status(201).json({
                    success: false,
                    message: "Barcode not found",
                });
            }
        });
    },
];
