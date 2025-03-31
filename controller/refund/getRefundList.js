const refundSchema = require("../../sharedmb/schema/refund");
const orderSchema = require("../../sharedmb/schema/order");
const mongoose = require("mongoose");

const getRefundList = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            orderId,
            search,
        } = req.query;

        // Build filter conditions
        const filter = {};

        // Status filter
        if (status) {
            filter.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Order ID filter
        if (orderId) {
            const order = await orderSchema.findOne({ id: Number(orderId) });
            if (order) {
                filter.orderId = order._id;
            }
        }

        // Search filter (search in refund ID or order ID)
        if (search) {
            filter.$or = [
                { id: Number(search) || -1 },
                { "orderId.id": Number(search) || -1 },
            ];
        }

        // Calculate pagination
        const skip = (Number(page) - 1) * Number(limit);
        const limitValue = Number(limit);

        // Get total count for pagination
        const total = await refundSchema.countDocuments(filter);

        // Get refunds with pagination and populate order details
        const refunds = await refundSchema
            .find(filter)
            .populate({
                path: "orderId",
                select: "id amount product createdAt",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitValue);

        return res.status(200).json({
            success: true,
            data: refunds,
            pagination: {
                total,
                page: Number(page),
                limit: limitValue,
                totalPages: Math.ceil(total / limitValue),
            },
        });
    } catch (error) {
        console.error("Error in getRefundList:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching refund list",
            error: error.message,
        });
    }
};

module.exports = getRefundList;
