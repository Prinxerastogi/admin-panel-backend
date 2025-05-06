const productGroupSchema = require("../../sharedmb/schema/productGroup");
const validate = require("express-validation");
const validation = require("./validation");

const deleteProductGroup = async (req, res) => {
    const condition = { id: Number(req.params.id) };
    try {
        await productGroupSchema.findOneAndDelete(condition);

        return res.status(200).json({
            success: true,
            message: "Product group deleted successfully",
        });
    } catch (error) {
        return res.status(201).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

module.exports = [validate(validation.delete), deleteProductGroup];
