const refundSchema = require("../../sharedmb/schema/refund");
const updateRefundStatus = async (req, res) => {
    try {
        const { refundId } = req.body;
        let { status } = req.body;

        // Standardize status
        if (status === "accept") status = "accepted";
        if (status === "reject") status = "rejected";

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'accepted' or 'rejected'",
            });
        }

        // Find refund with populated order
        const refund = await refundSchema.findOne({ id: Number(refundId) });

        if (!refund) {
            return res.status(404).json({
                success: false,
                message: "Refund not found",
            });
        }

        if (refund.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: `Refund is already ${refund.status}`,
            });
        }

        await refundSchema.updateOne(
            { id: Number(refundId) },
            {
                $set: {
                    status,
                    rejectedOn: status === "rejected" ? new Date() : null,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: `Refund ${status} successfully`,
        });
    } catch (error) {
        console.error("Error in updateRefundStatus:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating refund status",
            error: error.message,
        });
    }
};

module.exports = updateRefundStatus;
