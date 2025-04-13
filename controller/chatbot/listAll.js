let ticketSchema = require("../../sharedmb/schema/ticket");
module.exports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPageLimit = 10;
        const totalTickets = await ticketSchema.countDocuments({
            isOfflineCustomer:
                req.query.customerType === "offline"
                    ? true
                    : req.query.customerType === "online"
                    ? false
                    : { $exists: true },
            ticketStatus:
                req.query.ticketType?.toLowerCase() === "all"
                    ? { $exists: true }
                    : req.query.ticketType?.toLowerCase(),
        });
        const paginatedTickets = await ticketSchema.aggregate([
            {
                $match: {
                    ticketStatus:
                        req.query.ticketType?.toLowerCase() === "all"
                            ? { $exists: true }
                            : req.query.ticketType?.toLowerCase(),
                    isOfflineCustomer:
                        req.query.customerType === "online"
                            ? false
                            : req.query.customerType === "offline"
                            ? true
                            : { $exists: true },
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: perPageLimit * (page - 1) },
            { $limit: perPageLimit },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                },
            },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    ticketStatus: 1,
                    chatProgress: 1,
                    createdAt: 1,
                    ticketTag: 1,
                    isOfflineCustomer: 1,
                    user: {
                        name: 1,
                        phoneNo: 1,
                        email: 1,
                    },
                },
            },
        ]);
        return res.json({
            success: true,
            message: "Tickets fetched successfully",
            tickets: paginatedTickets,
            totalTickets: totalTickets,
            totalPages: Math.ceil(totalTickets / perPageLimit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
