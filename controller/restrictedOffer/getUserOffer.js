const { Types } = require("mongoose");
const restrictedOfferModel = require("../../sharedmb/schema/restrictedOffer");

module.exports = async (req, res) => {
    try {
        const result = await restrictedOfferModel.find({
            phoneNo: Number(req.params.userId),
            offerId: (req.params.offerId),
        });
        return res.json({ success: true, data: result[0] });
    } catch (error) {
        console.error('error in getting user by offer', error)
        return res.json({ success: false, message: "INTERNAL SERVER ERROR" });
    }
};
