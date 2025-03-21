const Order = require("../../sharedmb/schema/order");

const getRatings = async (req, res) => {
    try {
        let {
            sortBy,
            ratingFilter,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        let matchStage = {};

        // Ensure `created` is stored as a Date, not a string
        if (ratingFilter) {
            matchStage.rating = parseInt(ratingFilter);
        } else {
            matchStage.rating = { $exists: true, $ne: 0 };
        }

        // Start & End Date Filtering
        if (startDate || endDate) {
            matchStage.date = {};
            if (startDate) matchStage.date.$gte = new Date(startDate);
            if (endDate) matchStage.date.$lte = new Date(endDate);
        }

        console.log("matchStage", matchStage);
        // Sorting logic
        let sortStage = {};
        if (sortBy === "latest") {
            sortStage.created = -1; // Sort by newest first
        } else if (sortBy === "highest") {
            sortStage.rating = -1; // Sort by highest rating first
        } else if (sortBy === "lowest") {
            sortStage.rating = 1; // Sort by highest rating first
        }

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    rating: 1,
                    deliveryBoyRating: 1,
                    deliveryBoyComments: 1,
                    created: 1,
                },
            },
        ];

        // Only add sort stage if it's not empty
        if (Object.keys(sortStage).length > 0) {
            aggregationPipeline.push({ $sort: sortStage });
        }

        // Pagination
        aggregationPipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: limit }
        );

        const orders = await Order.aggregate(aggregationPipeline);

        res.json({
            success: true,
            orders,
            message: "Order fetch successful",
            page,
            limit,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = getRatings;
