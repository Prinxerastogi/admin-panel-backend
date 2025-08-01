const restrictedOfferModel = require("../../sharedmb/schema/restrictedOffer");

module.exports = [
    async (req, res) => {
        const { phoneNo } = req.body;
        const offerId = req.params.offerId;

        if (!Array.isArray(phoneNo)) {
            return res
                .status(400)
                .json({ message: "phoneNo must be an array" });
        }

        // 1. Find existing users with the same phone numbers for this offer
        const existing = await restrictedOfferModel
            .find({
                phoneNo: { $in: phoneNo },
                offerId,
            })
            .select("phoneNo");

        const existingPhoneNos = existing.map((user) =>
            user.phoneNo.toString()
        );

        // 2. Filter out already added numbers
        const newPhoneNos = phoneNo.filter(
            (pn) => !existingPhoneNos.includes(pn.toString())
        );

        // 3. Create new entries
        const newUsers = newPhoneNos.map((pn) => ({
            phoneNo: pn,
            offerId,
        }));

        if (newUsers.length === 0) {
            return res.status(200).json({ message: "No new users to add" });
        }

        await restrictedOfferModel.insertMany(newUsers);

        res.status(200).json({
            message: "Users added successfully",
            added: newUsers.length,
        });
    },
];
