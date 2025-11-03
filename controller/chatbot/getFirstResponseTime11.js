"use strict";
const crudModel = require("../../sharedmb/models/crud");
const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const BUSINESS_START_HOUR_UTC = 3;
const BUSINESS_START_MIN_UTC = 30;
const BUSINESS_END_HOUR_UTC = 14;
const BUSINESS_END_MIN_UTC = 30;

const getTicketGraphDataWithWorkingHours = async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate =
            start && moment(start).isValid()
                ? moment.utc(start).startOf("day")
                : moment().utc().subtract(7, "days").startOf("day");

        let endDate =
            end && moment(end).isValid()
                ? moment.utc(end).endOf("day")
                : moment().utc().endOf("day");

        console.log("start Date-->", startDate.toDate());
        console.log("end date--->", endDate.toDate());

        const condition = [
            {
                $unwind: "$chats",
            },
            {
                $match: {
                    createdAt: {
                        $gte: startDate.toDate(),
                        $lte: endDate.toDate(),
                    },
                    "chats.isCustomMessage": true,
                },
            },

            {
                $addFields: {
                    adjustedCreatedAt: {
                        $let: {
                            vars: {
                                created: "$createdAt",
                                createdHour: { $hour: "$createdAt" },
                                createdMinute: { $minute: "$createdAt" },
                                createdYear: { $year: "$createdAt" },
                                createdMonth: { $month: "$createdAt" },
                                createdDay: { $dayOfMonth: "$createdAt" },
                            },
                            in: {
                                $cond: {
                                    if: {
                                        $or: [
                                            {
                                                $gt: [
                                                    "$$createdHour",
                                                    BUSINESS_END_HOUR_UTC,
                                                ],
                                            },
                                            {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            "$$createdHour",
                                                            BUSINESS_END_HOUR_UTC,
                                                        ],
                                                    },
                                                    {
                                                        $gt: [
                                                            "$$createdMinute",
                                                            BUSINESS_END_MIN_UTC,
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    then: {
                                        $dateAdd: {
                                            startDate: {
                                                $dateFromParts: {
                                                    year: "$$createdYear",
                                                    month: "$$createdMonth",
                                                    day: "$$createdDay",
                                                    hour: BUSINESS_START_HOUR_UTC,
                                                    minute: BUSINESS_START_MIN_UTC,
                                                    second: 0,
                                                    millisecond: 0,
                                                    timezone: "UTC",
                                                },
                                            },
                                            unit: "day",
                                            amount: 1,
                                        },
                                    },

                                    else: {
                                        $cond: {
                                            if: {
                                                $or: [
                                                    {
                                                        $lt: [
                                                            "$$createdHour",
                                                            BUSINESS_START_HOUR_UTC,
                                                        ],
                                                    },
                                                    {
                                                        $and: [
                                                            {
                                                                $eq: [
                                                                    "$$createdHour",
                                                                    BUSINESS_START_HOUR_UTC,
                                                                ],
                                                            },
                                                            {
                                                                $lt: [
                                                                    "$$createdMinute",
                                                                    BUSINESS_START_MIN_UTC,
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            then: {
                                                $dateFromParts: {
                                                    year: "$$createdYear",
                                                    month: "$$createdMonth",
                                                    day: "$$createdDay",
                                                    hour: BUSINESS_START_HOUR_UTC,
                                                    minute: BUSINESS_START_MIN_UTC,
                                                    second: 0,
                                                    millisecond: 0,
                                                    timezone: "UTC",
                                                },
                                            },

                                            else: "$$created",
                                        },
                                    },
                                },
                            },
                        },
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
                                date: "$adjustedCreatedAt",
                            },
                        },
                    },
                    firstCustomMessageTime: { $first: "$chats.date" },
                    adjustedCreatedAt: { $first: "$adjustedCreatedAt" },
                },
            },
            {
                $match: {
                    firstCustomMessageTime: { $ne: null },
                },
            },
            {
                $addFields: {
                    firstResponseTime: {
                        $subtract: [
                            "$firstCustomMessageTime",
                            "$adjustedCreatedAt",
                        ],
                    },
                },
            },
            {
                $project: {
                    day: "$_id.day",
                    firstCustomMessageTime: 1,
                    ticketId: "$_id.ticketId",
                    adjustedCreatedAt: 1,
                    firstResponseTime: 1,
                },
            },
            {
                $group: {
                    _id: "$day",
                    count: { $sum: 1 },
                    totalFirstResponseTime: {
                        $sum: {
                            $cond: {
                                if: { $gt: ["$firstResponseTime", 0] },
                                then: "$firstResponseTime",
                                else: 0,
                            },
                        },
                    },
                    validResponseCount: {
                        $sum: {
                            $cond: {
                                if: { $gt: ["$firstResponseTime", 0] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    avgFirstResponseTime: {
                        $avg: {
                            $cond: {
                                if: { $gt: ["$firstResponseTime", 0] },
                                then: "$firstResponseTime",
                                else: null,
                            },
                        },
                    },
                },
            },

            {
                $match: {
                    _id: {
                        $gte: startDate.format("YYYY-MM-DD"),
                        $lte: endDate.format("YYYY-MM-DD"),
                    },
                },
            },
        ];

        crudModel.aggregation(condition, Ticket, (err, group) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Error retrieving ticket analytics",
                    error: err.message,
                });
            }

            if (!group || group.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: "No ticket data found for the specified period",
                    data: [],
                    averageFirstResponseTime: 0,
                    totalTicketCreated: 0,
                    averageTicketCreated: 0,
                });
            }

            const avgFirstResponseTime = group.reduce(
                (acc, curr) => {
                    if (curr.validResponseCount > 0) {
                        acc.totalTime += curr.totalFirstResponseTime;
                        acc.totalCount += curr.validResponseCount;
                    }
                    return acc;
                },
                { totalTime: 0, totalCount: 0 }
            );

            const averageFirstResponseTime =
                avgFirstResponseTime.totalCount > 0
                    ? avgFirstResponseTime.totalTime /
                      avgFirstResponseTime.totalCount /
                      1000 /
                      60
                    : 0;

            const totalTicketCreated = group.reduce(
                (total, curr) => total + curr.count,
                0
            );
            const averageTicketCreated = totalTicketCreated / group.length;

            group.sort((a, b) => a._id.localeCompare(b._id));

            return res.status(200).json({
                success: true,
                message:
                    "Ticket analytics retrieved successfully with time adjustment",
                data: group,
                averageFirstResponseTime: averageFirstResponseTime
                    ? Math.round(averageFirstResponseTime * 100) / 100
                    : 0,
                totalTicketCreated: totalTicketCreated,
                averageTicketCreated: averageTicketCreated,
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

module.exports = [getTicketGraphDataWithWorkingHours];
