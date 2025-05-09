

"use strict";
const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const getTicketGraphData = async (req, res) => {
    try {
        const selectedDate = req.query.date
            ? moment(req.query.date).startOf("day")
            : moment().startOf("day");

        // End of the same day
        const endOfDay = moment(selectedDate).endOf("day");

        // Find tickets created on the selected date
        const tickets = await Ticket.find({
            createdAt: {
                $gte: selectedDate.toDate(),
                $lte: endOfDay.toDate(),
            },
        });

        // Calculate average times
        let totalTickets = tickets.length;
        let totalResolutionTimeMinutes = 0;
        let resolutionTimeCount = 0;
        let totalFirstMessageTimeMinutes = 0;
        let firstMessageCount = 0;

        tickets.forEach((ticket) => {
            // Calculate resolution time if available
            if (ticket.resolutionTime) {
                const creationTime = moment(ticket.createdAt);
                const resolvedTime = moment(ticket.resolutionTime);
                const diffMinutes = resolvedTime.diff(creationTime, "minutes");

                totalResolutionTimeMinutes += diffMinutes;
                resolutionTimeCount++;
            }

            if (ticket.chats && ticket.chats.length > 0) {
                const firstCustomerMessage = ticket.chats.find(
                    (chat) =>
                        chat.source === "server" &&
                        chat.isCustomMessage === true
                );

                if (firstCustomerMessage && firstCustomerMessage.date) {
                    const creationTime = moment(ticket.createdAt);
                    const firstMessageTime = moment(firstCustomerMessage.date);
                    const diffMinutes = firstMessageTime.diff(
                        creationTime,
                        "minutes"
                    );

                    totalFirstMessageTimeMinutes += diffMinutes;
                    firstMessageCount++;
                }
            }
        });

        // Calculate averages
        const averageTicketsPerDay = totalTickets;
        const averageFirstMessageTime =
            firstMessageCount > 0
                ? (totalFirstMessageTimeMinutes / firstMessageCount).toFixed(2)
                : 0;
        const averageResolutionTime =
            resolutionTimeCount > 0
                ? (totalResolutionTimeMinutes / resolutionTimeCount).toFixed(2)
                : 0;

        return res.status(200).json({
            success: true,
            data: {
                averageTicketsPerDay,
                averageFirstMessageTime,
                averageResolutionTime,
            },
        });
    } catch (error) {
        console.error("Error generating ticket analytics:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate ticket analytics",
            error: error.message,
        });
    }
};

module.exports = [getTicketGraphData];