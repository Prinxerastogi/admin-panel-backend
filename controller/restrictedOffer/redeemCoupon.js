const restrictedOfferModel = require("../../sharedmb/schema/restrictedOffer");
module.exports = [
    async (req, res) => {
        try {
            const { userId, offerId, mode } = req.params;
            if (!["online", "offline"].includes(mode))
                return res
                    .status(400)
                    .json({ message: "Invalid redemption mode" });

            const updated = await restrictedOfferModel.findOneAndUpdate(
                { phoneNo: userId, offerId, status: "active" },
                {
                    $set: {
                        status: "redeemed",
                        redeemedOn: new Date(),
                        redeemedMode: mode,
                    },
                },
                { new: true }
            );

            if (!updated)
                return res.status(201).json({
                    success: false,
                    message: "Restricted offer not found",
                });

            res.json({
                success: true,
                message: "Coupon redeemed",
                data: updated,
            });
        } catch (err) {
            res.status(500).json({
                message: "Error redeeming coupon",
                error: err.message,
            });
        }
    },
];
