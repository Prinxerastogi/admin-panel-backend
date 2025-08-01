const restrictedOfferModel = require("../../sharedmb/schema/restrictedOffer");
module.exports = [
    async (req, res) => {
        try {
            const { userId, offerId } = req.params;
            const deleted = await restrictedOfferModel.findOneAndDelete({
                phoneNo: userId,
                offerId,
            });

            if (!deleted)
                return res.status(404).json({ message: "Entry not found" });

            res.json({ message: "User removed from offer", data: deleted });
        } catch (err) {
            res.status(500).json({
                message: "Error removing user",
                error: err.message,
            });
        }
    },
];
