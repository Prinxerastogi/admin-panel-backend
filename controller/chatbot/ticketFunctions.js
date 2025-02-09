let crudModel = require("../../sharedmb/models/crud");
let ticketSchema = require("../../sharedmb/schema/ticket");
let userSchema = require("../../sharedmb/schema/user");
let orderSchema = require("../../sharedmb/schema/order");
const ticketFunctions = {
    technicalIssue: () => {
        return {
            chat: {
                source: "server",
                message: "Please describe the issue you are facing",
                buttons: [
                    {
                        title: "Address related issue",
                        code: "addressTechIssue",
                    },
                    {
                        title: "Payment related issue",
                        code: "paymentTechIssue",
                    },
                    {
                        title: "Other technical issue",
                        code: "otherTechIssue",
                    },
                    {
                        title: "Back to main menu",
                        code: "restartBot",
                    },
                    {
                        title: "Okay, close chat.",
                        code: "endChat",
                    },
                ],
            },
            type: "message",
        };
    },
    orderRelated: async (objectIds) => {
        const ticket = await ticketSchema.findById(objectIds.ticketId);
        const user = await userSchema.findById(ticket.userId);
        const last3orders = await orderSchema
            .find({ userId: ticket.userId })
            .sort({ created: -1 })
            .limit(3);
        const shortOrders = last3orders.map((order) => {
            return {
                title: `#${JSON.stringify(order.id)} (${order.status}) ₹${
                    order.amount?.value
                } - ${moment(order.created).format("DD MMM")} `,
                code: `specificOrderIssue`,
                metadata: { orderId: order._id },
            };
        });
        return {
            chat: {
                source: "server",
                message: `Please choose the order `,
                buttons: [
                    ...shortOrders,
                    {
                        title: "My order is not listed here",
                        code: "otherIssue",
                    },
                    {
                        title: "Back to main menu",
                        code: "restartBot",
                    },
                    {
                        title: "Okay, close chat.",
                        code: "endChat",
                    },
                ],
            },
            type: "message",
        };
    },
    specificOrderIssue: async (objectIds) => {
        console.log("objectIds specificOrderIssue", objectIds);
        if (!objectIds?.metadata?.orderId) {
            return {
                chat: {
                    source: "server",
                    message:
                        "Please describe the issue in detail. Upload screenshots if required.",
                },
                type: "message",
            };
        } else {
            const currOrderId = objectIds.metadata.orderId;
            const currentOrder = await orderSchema.findById(currOrderId);
            switch (currentOrder.status) {
                case "delivered":
                    if (
                        currentOrder?.deliveredDate >
                        moment().subtract(7, "days")
                    )
                        return {
                            chat: {
                                source: "server",
                                message: `This order was delivered within 7 days`,
                            },
                            type: "message",
                        };
                    else
                        return {
                            chat: {
                                source: "server",
                                message: `This order was delivered past 7 days`,
                            },
                            type: "message",
                        };
                case "cancelled":
                    if (currentOrder?.userCancelStatus)
                        return {
                            chat: {
                                source: "server",
                                message: `This order was cancelled by you.`,
                                buttons: [
                                    {
                                        title: "Request to restore order.",
                                        code: "restoreOrder",
                                        metadata: { orderId: currentOrder._id },
                                    },
                                    {
                                        title: "My issue is not listed here",
                                        code: "otherIssue",
                                    },
                                    {
                                        title: "Okay, close chat.",
                                        code: "endChat",
                                    },
                                    {
                                        title: "Back to main menu",
                                        code: "restartBot",
                                    },
                                ],
                            },
                            type: "message",
                        };
                    else
                        return {
                            chat: {
                                source: "server",
                                message: `You had requested to cancel this order on ${moment(
                                    order?.userCancelDate
                                ).format("DD MMM YYYY hh:mm A")}`,
                                buttons: [
                                    {
                                        title: "Reorder.",
                                        code: "reOrder",
                                        metadata: { orderId: currentOrder._id },
                                    },
                                    {
                                        title: "My issue is not listed here",
                                        code: "otherIssue",
                                    },
                                    {
                                        title: "Okay, close chat.",
                                        code: "endChat",
                                    },
                                    {
                                        title: "Back to main menu",
                                        code: "restartBot",
                                    },
                                ],
                            },
                            type: "message",
                        };
                default:
                    return {
                        chat: {
                            source: "server",
                            message: `This order is not yet delivered`,
                        },
                        type: "message",
                    };
            }
        }
    },
    handleCustomMessage: async (objectIds) => {
        return {
            chat: {
                source: "server",
                message:
                    "We have noted your concern. Our team will get back to you soon.",
                buttons: [
                    {
                        title: "Okay, close chat.",
                        code: "endChat",
                    },
                    {
                        title: "Back to main menu",
                        code: "restartBot",
                    },
                ],
            },

            type: "message",
        };
    },
    otherIssue: async () => {
        return {
            chat: {
                source: "server",
                message:
                    "Please describe the issue in detail. Upload screenshots if required.",
            },
            type: "message",
        };
    },
    reOrder: async (objectIds) => {
        const currentOrder = await orderSchema.findById(
            objectIds?.metadata?.orderId
        );
        return {
            chat: {
                source: "server",
                message: "Please describe the issue in detail",
            },
            type: "message",
        };
    },
    addComments: async () => {
        return {
            chat: {
                source: "server",
                message: "Please describe the issue in detail",
            },
            type: "message",
        };
    },
    endChat: async (objectIds) => {
        let currentTicket = objectIds?.ticketId;
        let currentUser = null;
        let currentOrder = null;
        if (currentTicket) {
            try {
                currentTicket = await ticketSchema.findByIdAndUpdate(
                    currentTicket,
                    {
                        $set: {
                            ticketStatus: "closed",
                        },
                        $push: {
                            chats: {
                                message: "Okay, close chat.",
                                source: "customer",
                            },
                        },
                    },
                    {
                        new: true,
                    }
                );
            } catch (error) {
                console.log("failed to close ticket");
            }
        }

        return {
            type: "action",
        };
    },
    offlineStoreIssue: async () => {
        return ticketFunctions.otherIssue();
    },
    addressTechIssue: async () => {
        return {
            chat: {
                source: "server",
                message:
                    "Please describe the issue you are facing. Upload screenshots if necessary.",
                buttons: [
                    {
                        title: "Back to main menu",
                        code: "restartBot",
                    },
                ],
            },

            type: "message",
        };
    },
    paymentTechIssue: async () => {
        return {
            chat: {
                source: "server",
                message:
                    "Please describe the issue in detail. Upload screenshots if required.",
                buttons: [
                    {
                        title: "Back to main menu",
                        code: "restartBot",
                    },
                ],
            },

            type: "message",
        };
    },
    otherTechIssue: async () => {
        return {
            chat: {
                source: "server",
                message:
                    "Please describe the issue in detail. Upload screenshots if required.",
                buttons: [
                    {
                        title: "Back to main menu",
                        code: "restartBot",
                    },
                ],
            },

            type: "message",
        };
    },
    restartBot: () => {
        return {
            chat: {
                source: "server",
                message: "Welcome to AapKaBazar. How may I help you?",
                buttons: [
                    {
                        title: "Facing a technical issue",
                        code: "technicalIssue",
                    },
                    {
                        title: "Order related issue",
                        code: "orderRelated",
                    },
                    {
                        title: "Report store related issue",
                        code: "offlineStoreIssue",
                    },
                    {
                        title: "My issue is not listed here",
                        code: "otherIssue",
                    },
                    {
                        title: "Okay, close chat.",
                        code: "endChat",
                    },
                ],
            },
            type: "message",
        };
    },
};
module.exports = ticketFunctions;
