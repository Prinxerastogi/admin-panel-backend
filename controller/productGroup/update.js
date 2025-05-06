const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");
const mongoose = require("mongoose");
const validate = require("express-validation");
const validation = require("./validation");

const updateProductGroup = (req, res) => {
    const condition = { id: Number(req.params.id) };
    const update = {
        $set: {
            name: req.body.name,
            products: req.body.products.map((id) =>
                mongoose.Types.ObjectId(id)
            ),
            updated: new Date().getTime(),
        },
    };

    crudModel.findOneAndUpdate(
        condition,
        update,
        { new: true },
        productGroupSchema,
        (err, updated) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error updating product group",
                    error: err.message,
                });
            }
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Product group not found",
                });
            }
            return res.status(200).json({
                success: true,
                message: "Product group updated successfully",
                data: updated,
            });
        }
    );
};

module.exports = [validate(validation.update), updateProductGroup];
