const Offer = require("../../sharedmb/schema/offer");

const toggleOfferStatus = async (req, res) => {
    try {
        const { offerId } = req.body;

        if (!offerId) {
            return res.status(400).json({
                success: false,
                message: "Offer ID is required",
            });
        }

        const offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found",
            });
        }

        if (offer.expireDate && offer.expireDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot activate expired offer",
                isExpired: true,
            });
        }

        offer.isActive = !offer.isActive;
        offer.updated = Date.now();
        await offer.save();

        console.log(
            `Offer ${offerId} (${offer.promocode}) status changed to ${
                offer.isActive ? "active" : "inactive"
            }`
        );

        return res.status(200).json({
            success: true,
            isActive: offer.isActive,
            message: `Offer "${offer.name}" is now ${
                offer.isActive ? "active" : "inactive"
            }`,
            promocode: offer.promocode,
        });
    } catch (error) {
        console.error("Error toggling offer status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = toggleOfferStatus;
