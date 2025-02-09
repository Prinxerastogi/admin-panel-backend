const withdrawalSchema = require("../../sharedmb/schema/deliveryPartnerWithdrawal");

const rejectReq = async (req, res, next) => {
    try {
        const update = await withdrawalSchema.findOneAndUpdate(
            { _id: Types.ObjectId(req.body._id) },
            { $set: { status: "failure", actionDate: new Date() } }
        );
        if (update) {
            return res.json({ success: true, message: "request rejected" });
        }
        return res.json({ success: false, message: "unabel to find request" });
    } catch (error) {
        console.log("error in rejecting request : ", error);
        return res.json({
            success: false,
            message: "Unable to reject request",
        });
    }
};

module.exports = [rejectReq];
