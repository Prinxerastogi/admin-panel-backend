let crud = require("../../../sharedmb/models/crud");
let sellerSchema = require("../../../sharedmb/schema/seller");

module.exports = (req, res) => {
    let condition = {
        _id: req.params.sellerId,
    };
    sellerSchema.findOne(condition, {}, (err, seller) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: "error occured in assign area of seller",
                err,
            });
        } else if (seller) {
            return res.status(200).json({
                success: true,
                message: "Seller Found",
                area: seller.area,
            });
        } else {
            return res
                .status(201)
                .json({ success: false, message: "Seller Not found" });
        }
    });
    //}
};
