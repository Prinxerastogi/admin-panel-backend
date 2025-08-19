let ticketSchema = require("../../sharedmb/schema/ticket");

module.exports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPageLimit = 10;

        // Build match conditions
        let matchConditions = {
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
            chatProgress:
                req.query.chatProgress?.toLowerCase() === "all"
                    ? { $exists: true }
                    : req.query.chatProgress?.toLowerCase()
                    ? req.query.chatProgress?.toLowerCase()
                    : { $exists: true },
        };

        // Add date range filter
        if (req.query.startDate || req.query.endDate) {
            matchConditions.createdAt = {};

            if (req.query.startDate) {
                const startDate = new Date(req.query.startDate);
                // Check if date is valid
                if (!isNaN(startDate.getTime())) {
                    startDate.setHours(0, 0, 0, 0);
                    matchConditions.createdAt.$gte = startDate;
                }
            }

            if (req.query.endDate) {
                const endDate = new Date(req.query.endDate);
                // Check if date is valid
                if (!isNaN(endDate.getTime())) {
                    endDate.setHours(23, 59, 59, 999);
                    matchConditions.createdAt.$lte = endDate;
                }
            }
        }

        // Get total tickets count with filters
        const totalTickets = await ticketSchema.countDocuments(matchConditions);

        // Get status wise count
        const statusCountPipeline = [
            { $match: matchConditions },
            {
                $group: {
                    _id: "$ticketStatus",
                    count: { $sum: 1 }
                }
            }
        ];

        const statusCounts = await ticketSchema.aggregate(statusCountPipeline);
        
        // Format status counts
        const statusCountMap = {
            open: 0,
            closed: 0,
            resolved: 0
        };

        statusCounts.forEach(status => {
            if (statusCountMap.hasOwnProperty(status._id)) {
                statusCountMap[status._id] = status.count;
            }
        });

        const paginatedTickets = await ticketSchema.aggregate([
            { $match: matchConditions },
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
                    note: 1,
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
            statusCounts: statusCountMap
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};