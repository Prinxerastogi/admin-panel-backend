const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");

const addProductToGroup = async (req, res) => {
    const productid = Number(req.params.productid);
    const groupid = Number(req.params.groupid);

    if (isNaN(productid)) {
        return res.json({ success: false, message: "Invalid id" });
    }
    try {
        await productGroupSchema.updateMany(
            { products: productid },
            { $pull: { products: productid } },
            { new: true }
        );
        const updatedGroup = await productGroupSchema
            .findOneAndUpdate(
                { id: groupid },
                { $push: { products: productid } },
                {
                    new: true,
                    runValidators: true,
                }
            )
            .exec();

        if (!updatedGroup) {
            return res.status(404).json({
                success: false,
                message: "Product group not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully added product to group",
            data: updatedGroup,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Error adding product to productgroup",
            error: err.message,
        });
    }
};

module.exports = [addProductToGroup];
