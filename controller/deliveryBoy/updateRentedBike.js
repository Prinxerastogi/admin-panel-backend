const deliveryBoySchema = require("../../sharedmb/schema/deliveryBoy");

const updateBikeRented = async (req, res) => {
    try {
        const { deliveryPartnerId, bikeRented } = req.body;

        if (!deliveryPartnerId) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Delivery Boy ID is required",
                });
        }

        const result = await deliveryBoySchema.updateOne(
            { _id: deliveryPartnerId },
            { $set: { bikeRented } }
        );

        
        return res.json({
            success: true,
            message: `Bike rental status updated successfully`,
        });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: "Server Error" });
    }
};

module.exports = [updateBikeRented];
