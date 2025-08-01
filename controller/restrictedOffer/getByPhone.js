const restrictedOfferModel = require("../../sharedmb/schema/restrictedOffer");
module.exports = [
    async (req, res) => {
        try {
            const phone = Number(req.params.phone);
            const offers = await restrictedOfferModel
                .find({ "account.phoneNo": phone })
                .populate("offerId");
            res.json(offers);
        } catch (err) {
            res.status(500).json({
                message: "Error fetching offers",
                error: err.message,
            });
        }
    },
];
