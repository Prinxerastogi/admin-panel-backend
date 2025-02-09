let crudModel = require("../../sharedmb/models/crud");
let offerSchema = require("../../sharedmb/schema/offer");

let updateOffer = (req, res) => {
    let condition = {
        _id: req.params.offerId,
    };
    let update = {
        $set: req.body,
    };
    let Option = {};
    crudModel.findOneAndUpdate(
        condition,
        update,
        Option,
        offerSchema,
        (err, updated) => {
            if (err) {
                return res
                    .status(400)
                    .json({ success: false, message: "error", err });
            } else {
                res.status(200).json({
                    success: true,
                    message: "updated successfully",
                    offer: updated,
                });
            }
        }
    );
};

module.exports = [updateOffer];
