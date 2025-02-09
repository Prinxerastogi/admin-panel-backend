const withdrawalSchema = require("../../sharedmb/schema/deliveryPartnerWithdrawal");

const getList = async (req, res, next) => {
    try {
        const result = await withdrawalSchema.aggregate([
            {
                $match: {
                    // status: "pending"
                },
            },
            {
                $lookup: {
                    from: "deliveryboys",
                    localField: "deliveryPartnerId",
                    foreignField: "_id",
                    as: "deliveryPartner",
                },
            },
            {
                $unwind: "$deliveryPartner",
            },
            {
                $project: {
                    created: 1,
                    _id: 1,
                    id: 1,
                    status: 1,
                    amount: 1,
                    name: "$deliveryPartner.name",
                    phoneNo: "$deliveryPartner.phoneNo",
                    floatingCash: "$deliveryPartner.floatingCash",
                    currentBalance: "$deliveryPartner.currentBalance",
                },
            },
            {
                $sort: {
                    id: -1,
                },
            },
            {
                $limit: 50,
            },
        ]);

        if (result.length > 0) {
            return res.json({
                success: true,
                message: "List found",
                list: result,
            });
        }
        return res.json({
            success: true,
            message: "No pending withdrawals found",
            list: [],
        });
    } catch (error) {
        console.error("Error fetching withdrawal list:", error); // Log error details for debugging
        return res.status(500).json({
            success: false,
            message: "INTERNAL SERVER ERROR",
            list: [],
        });
    }
};

module.exports = [getList];
