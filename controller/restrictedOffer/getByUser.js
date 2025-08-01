const restrictedOfferModel = require("../../sharedmb/schema/restrictedOffer");
module.exports = [
    async (req, res) => {
        try {
            const offers = await restrictedOfferModel
                .find({ phoneNo: req.params.userId })
                .populate("offerId");
            res.json(offers);
        } catch (err) {
            res.status(500).json({
                message: "Error fetching user's restricted offers",
                error: err.message,
            });
        }
    },
];
