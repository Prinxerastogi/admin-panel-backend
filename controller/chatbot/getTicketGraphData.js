"use strict";
const crudModel = require("../../sharedmb/models/crud");

const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const getTicketGraphData = async (req, res) => {
    try {
        const { start, end } = req.query;
        const now = moment().utc();

        const startDate =
            start && moment(start).isValid()
                ? moment.utc(start).startOf("day")
                : moment().utc().subtract(7, "days").startOf("day");

        let endDate =
            end && moment(end).isValid()
                ? moment.utc(end).endOf("day")
                : now.clone().endOf("day");

        console.log("start Date-->", startDate.toDate());
        console.log("end date--->", endDate.toDate());

        const condition = [
            {
                $match: {
                    createdAt: {
                        $gte: startDate.toDate(),
                        $lte: endDate.toDate(),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        ticketId: "$_id",
                        day: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            },
                        },
                    },
                    resolutionTime: {
                        $first: "$resolutionTime",
                    },

                    createdAt: {
                        $first: "$createdAt",
                    },
                },
            },
            {
                $project: {
                    day: "$_id.day",
                    resolutionTime: 1,

                    ticketId: "$_id.ticketId",
                    createdAt: 1,
                },
            },
            {
                $match: {
                    resolutionTime: { $ne: null },
                },
            },
            {
                $group: {
                    _id: "$day",
                    count: {
                        $sum: 1,
                    },
                    totalResolutionTime: {
                        $sum: {
                            $subtract: ["$resolutionTime", "$createdAt"],
                        },
                    },
                    avgResolutionTime: {
                        $avg: {
                            $subtract: ["$resolutionTime", "$createdAt"],
                        },
                    },
                },
            },
        ];

        crudModel.aggregation(condition, Ticket, (err, group) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error retrieving product group",
                    error: err.message,
                });
            }
            if (!group || group.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No ticket data found for this period",
                    data: [],
                    averageFirstResponseTime: 0,
                    avgResolutionTime: 0,
                    AverageTicketCreated: 0,
                    totalTicketCreated: 0,
                });
            }

            const avgResolutionTimeDeduce = group.reduce(
                (acc, curr) => {
                    acc.totalTime += curr.totalResolutionTime;
                    acc.totalCount += curr.count;
                    return acc;
                },
                { totalTime: 0, totalCount: 0 }
            );

            const avgResolutionTime =
                avgResolutionTimeDeduce.totalCount > 0
                    ? avgResolutionTimeDeduce.totalTime /
                      avgResolutionTimeDeduce.totalCount /
                      1000 /
                      60
                    : null;

            const totalTicketCreated = group.reduce(
                (total, curr) => total + curr.count,
                0
            );
            const AverageTicketCreated = totalTicketCreated / group.length;

            group.sort((a, b) => a._id.localeCompare(b._id));

            return res.status(200).json({
                success: true,
                message: "Product group retrieved successfully",
                data: group,
                avgResolutionTime,
                AverageTicketCreated,
            });
        });
    } catch (err) {
        console.error("Ticket analytics error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

module.exports = [getTicketGraphData];
