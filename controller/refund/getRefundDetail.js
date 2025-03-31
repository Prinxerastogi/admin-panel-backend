const refundSchema = require("../../sharedmb/schema/refund");
const orderSchema = require("../../sharedmb/schema/order");
const userSchema = require("../../sharedmb/schema/user");
const adminSchema = require("../../sharedmb/schema/admin");

const getRefundDetail = async (req, res) => {
    try {
        const { refundId } = req.params;

        // Find refund by numeric ID
        const refund = await refundSchema
            .findOne({ id: Number(refundId) })
            .populate({
                path: "orderId",
                select: "id amount product createdAt deliveryCharge smallCartFee",
            })
            .populate({
                path: "acceptedBy",
                select: "name email",
            })
            .populate({
                path: "rejectedBy",
                select: "name email",
            });

        if (!refund) {
            return res.status(404).json({
                success: false,
                message: "Refund not found",
            });
        }

        // Get user details from order
        const order = await orderSchema
            .findOne({ _id: refund.orderId._id })
            .populate({
                path: "userId",
                select: "name email phone",
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Prepare response
        const response = {
            success: true,
            data: {
                refund: {
                    id: refund.id,
                    amount: refund.amount,
                    status: refund.status,
                    products: refund.products,
                    amountSplit: refund.amountSplit,
                    deliveryFee: refund.deliveryFee,
                    deliveryFeeAmount: refund.deliveryFeeAmount,
                    smallCartFee: refund.smallCartFee,
                    smallCartFeeAmount: refund.smallCartFeeAmount,
                    createdAt: refund.createdAt,
                    acceptedBy: refund.acceptedBy,
                    rejectedBy: refund.rejectedBy,
                    acceptedAt: refund.acceptedAt,
                    rejectedAt: refund.rejectedAt,
                },
                order: {
                    id: order.id,
                    amount: order.amount,
                    products: order.product,
                    deliveryCharge: order.deliveryCharge,
                    smallCartFee: order.smallCartFee,
                    createdAt: order.createdAt,
                },
                customer: order.userId,
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in getRefundDetail:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching refund details",
            error: error.message,
        });
    }
};

module.exports = getRefundDetail;
