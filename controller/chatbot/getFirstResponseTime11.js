"use strict";
const crudModel = require("../../sharedmb/models/crud");
const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const getTicketGraphDataWithWorkingHours = async (req, res) => {
  try {
    const { start, end } = req.query;
    const now = moment().utc();
    const setStartHour=15;
    const setEndHour=4;

    // Determine start and end dates
    const startDate = start && moment(start).isValid()
      ? moment(start).utc().startOf("day")
      : moment().utc().subtract(7, 'days').startOf("day");

    let endDate = end && moment(end).isValid()
      ? moment(end).utc().endOf("day")
      : now.clone().endOf("day");
 
    console.log("start Date-->", startDate.toDate());
    console.log("end date--->", endDate.toDate());

    const condition = [
      {
        $unwind: "$chats"
      },
      {
        $match: {
          "createdAt": {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          },
          "chats.isCustomMessage": true
        }
      },
      {
        $addFields: {
          adjustedCreatedAt: {
            $let: {
              vars: {
                hour: { $hour: "$createdAt" },
                date: "$createdAt"
              },
              in: {
                $cond: {
                  if: {
                    $or: [
                      { $gte: ["$$hour", setStartHour] }, 
                      { $lt: ["$$hour", setEndHour] } 
                    ]
                  },
                  then: {
                    $cond: {
                      if: { $gte: ["$$hour", setStartHour] },
                      then: {
                        $dateAdd: {
                          startDate: {
                            $dateFromParts: {
                              year: { $year: "$$date" },
                              month: { $month: "$$date" },
                              day: { $dayOfMonth: "$$date" },
                              hour: setEndHour,
                              minute: 0,
                              second: 0
                            }
                          },
                          unit: "day",
                          amount: 1
                        }
                      },
                      else: {
                        $dateFromParts: {
                          year: { $year: "$$date" },
                          month: { $month: "$$date" },
                          day: { $dayOfMonth: "$$date" },
                          hour: setEndHour,
                          minute: 0,
                          second: 0
                        }
                      }
                    }
                  },
                  else: "$$date" 
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            ticketId: "$_id",
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$adjustedCreatedAt"
              }
            }
          },
          firstCustomMessageTime: {
            $first: "$chats.date"
          },
          adjustedCreatedAt: {
            $first: "$adjustedCreatedAt"
          },
          originalCreatedAt: {
            $first: "$createdAt"
          }
        }
      },
      {
        $addFields: {
          firstResponseTime: {
            $subtract: ["$firstCustomMessageTime", "$adjustedCreatedAt"]
          }
        }
      },
      {
        $project: {
          day: "$_id.day",
          firstCustomMessageTime: 1,
          ticketId: "$_id.ticketId",
          adjustedCreatedAt: 1,
          originalCreatedAt: 1,
          firstResponseTime: 1
        }
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
                else: 0
              }
            }
          },
          validResponseCount: {
            $sum: {
              $cond: {
                if: { $gt: ["$firstResponseTime", 0] },
                then: 1,
                else: 0
              }
            }
          },
          avgFirstResponseTime: {
            $avg: {
              $cond: {
                if: { $gt: ["$firstResponseTime", 0] },
                then: "$firstResponseTime",
                else: null
              }
            }
          }
        }
      },
      {
        $addFields: {
          avgFirstResponseTimeMinutes: {
            $cond: {
              if: { $ne: ["$avgFirstResponseTime", null] },
              then: { $divide: ["$avgFirstResponseTime", 60000] },
              else: null
            }
          },
          totalFirstResponseTimeMinutes: {
            $cond: {
              if: { $gt: ["$totalFirstResponseTime", 0] },
              then: { $divide: ["$totalFirstResponseTime", 60000] }, 
              else: null
            }
          }
        }
      }
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
        return res.status(404).json({
          success: false,
          message: "No ticket data found for the specified period",
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
          ? avgFirstResponseTime.totalTime / avgFirstResponseTime.totalCount / 1000 / 60 // Convert to minutes
          : null;

      const totalTicketCreated = group.reduce((total, curr) => total + curr.count, 0);
      const averageTicketCreated = totalTicketCreated / group.length;

      group.sort((a, b) => a._id.localeCompare(b._id));

      return res.status(200).json({
        success: true,
        message: "Ticket analytics retrieved successfully with time adjustment",
        data: group,
        averageFirstResponseTime: averageFirstResponseTime ? 
          Math.round(averageFirstResponseTime * 100) / 100 : null, // Round to 2 decimal places
        totalTicketCreated: totalTicketCreated,
        averageTicketCreated: averageTicketCreated,
        businessLogic: {
          description: "Tickets created between 8 PM - 07:59 AM are considered as created at 11 AM",
          timeAdjustment: "8 PM onwards -> 9 AM next day, Before 9 AM -> 9 AM same day",
          note: "First response time calculated based on adjusted creation time"
        }
      });
    });

  } catch (err) {
    console.error("Ticket analytics error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: err.message 
    });
  }
};

module.exports = [getTicketGraphDataWithWorkingHours]; 
