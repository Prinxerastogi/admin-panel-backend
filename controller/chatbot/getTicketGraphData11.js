"use strict";
const crudModel = require("../../sharedmb/models/crud");
const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const BUSINESS_START_HOUR_UTC = 3;
const BUSINESS_START_MIN_UTC = 30;
const BUSINESS_END_HOUR_UTC = 14;
const BUSINESS_END_MIN_UTC = 30;

const getTicketGraphDataWithTimeAdjustment = async (req, res) => {
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
                $match: {
                    createdAt: {
                        $gte: startDate.toDate(),
                        $lte: endDate.toDate(),
                    },
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
                    resolutionTime: { $first: "$resolutionTime" },
                    adjustedCreatedAt: { $first: "$adjustedCreatedAt" },
                },
            },
            {
                $project: {
                    day: "$_id.day",
                    resolutionTime: 1,
                    ticketId: "$_id.ticketId",
                    adjustedCreatedAt: 1,
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
                            $subtract: [
                                "$resolutionTime",
                                "$adjustedCreatedAt",
                            ],
                        },
                    },
                    avgResolutionTime: {
                        $avg: {
                            $subtract: [
                                "$resolutionTime",
                                "$adjustedCreatedAt",
                            ],
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
                    message:
                        "No ticket data found for the specified date range",
                    data: [],
                    avgResolutionTime: 0,
                    AverageTicketCreated: 0,
                    totalTicketCreated: 0,
                });
            }

            const avgResolutionTimeDeduce = group.reduce(
                (acc, curr) => {
                    if (curr.totalResolutionTime > 0) {
                        acc.totalTime += curr.totalResolutionTime;
                        acc.totalCount += curr.count;
                    }
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
                avgResolutionTime: avgResolutionTime,
                AverageTicketCreated: averageTicketCreated,
                totalTicketCreated: totalTicketCreated,
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

module.exports = [getTicketGraphDataWithTimeAdjustment];
