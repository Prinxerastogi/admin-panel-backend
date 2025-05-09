const crudModel = require("../../sharedmb/models/crud");
const productGroupSchema = require("../../sharedmb/schema/productGroup");

const removeProductFromGroup = async (req, res) => {
  const productid = Number(req.params.productid);
  const groupid   = Number(req.params.groupid);

  if(isNaN(productid)){
    return res.json({success: false, message: "Invalid id"})
  }
  
  try {
    const group = await productGroupSchema.findOne({ id: groupid }).exec();
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Product group not found",
      });
    }

    const filtered = (group.products || []).filter(item => item !== productid);
    if (filtered.length === group.products.length) {
      // nothing removed
      return res.status(200).json({
        success: true,
        message: "Product was not in group; no changes made",
        data: group, 
      });
    }

    const updateResult = await productGroupSchema.updateOne(
      { id: groupid },
      { $set: { products: filtered } }
    ).exec();

    const updatedGroup = await productGroupSchema.findOne({ id: groupid }).exec();

    return res.status(200).json({
      success: true,
      message: "Successfully removed product from group",
      data: updatedGroup,
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Error removing product from product group",
      error: err.message,
    });
  }
};

module.exports = [ removeProductFromGroup ];
