"use strict";
const crudModel = require("../../sharedmb/models/crud");
const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const getTicketGraphDataWithTimeAdjustment = async (req, res) => {
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
      // {
      //   $unwind: "$chats"
      // },
      {
        $match: {
          "createdAt": {
            $gte: startDate.toDate(),
            $lte: endDate.toDate(),
          }
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
          resolutionTime: {
            $first: "$resolutionTime"
          },
          createdAt: {
            $first: "$createdAt"
          },
          adjustedCreatedAt: {
            $first: "$adjustedCreatedAt"
          }
        }
      },
      {
        $project: {
          day: "$_id.day",
          resolutionTime: 1,
          ticketId: "$_id.ticketId",
          createdAt: 1,
          adjustedCreatedAt: 1
        }
      },
      {
        $group: {
          _id: "$day",
          count: {
            $sum: 1
          },
          totalResolutionTime: {
            $sum: {
              $cond: {
                if: { $ne: ["$resolutionTime", null] },
                then: {
                  $subtract: [
                    "$resolutionTime",
                    "$adjustedCreatedAt"
                  ]
                },
                else: 0
              }
            }
          },
          avgResolutionTime: {
            $avg: {
              $cond: {
                if: { $ne: ["$resolutionTime", null] },
                then: {
                  $subtract: [
                    "$resolutionTime",
                    "$adjustedCreatedAt"
                  ]
                },
                else: null
              }
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
          message: "No ticket data found for the specified date range",
        });
      }

      // Calculate overall average resolution time
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
          ? avgResolutionTimeDeduce.totalTime / avgResolutionTimeDeduce.totalCount / 1000 / 60 // Convert to minutes
          : null;

      // Calculate total and average tickets created
      const totalTicketCreated = group.reduce((total, curr) => total + curr.count, 0);
      const averageTicketCreated = totalTicketCreated / group.length;

      // Sort by date
      group.sort((a, b) => a._id.localeCompare(b._id));

      // Convert resolution times to minutes for response
      const processedData = group.map(item => ({
        ...item,
        avgResolutionTimeMinutes: item.avgResolutionTime ? item.avgResolutionTime / 1000 / 60 : null,
        totalResolutionTimeMinutes: item.totalResolutionTime ? item.totalResolutionTime / 1000 / 60 : null
      }));

      return res.status(200).json({
        success: true,
        message: "Ticket analytics retrieved successfully with time adjustment",
        data: processedData,
        avgResolutionTime: avgResolutionTime, // in minutes
        AverageTicketCreated: averageTicketCreated,
        totalTicketCreated: totalTicketCreated,
        businessLogic: {
          description: "Tickets created between 8 PM - 07:59 AM are considered as created at 9 AM",
          timeAdjustment: "8 PM onwards -> 9 AM next day, Before 9 AM -> 9 AM same day"
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

module.exports = [getTicketGraphDataWithTimeAdjustment];