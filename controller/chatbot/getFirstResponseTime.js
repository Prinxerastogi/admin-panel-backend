"use strict";
const crudModel = require("../../sharedmb/models/crud");

const Ticket = require("../../sharedmb/schema/ticket");
const moment = require("moment");

const getTicketGraphData = async (req, res) => {
  try {
    const { start, end } = req.query;
    const now = moment().utc();

    // Determine start and end dates
    const startDate = start && moment(start).isValid()
      ? moment(start).utc().startOf("day")
      : moment().utc().subtract(7, 'days').startOf("day");

    let endDate = end && moment(end).isValid()
      ? moment(end).utc().endOf("day")
      : now.clone().endOf("day");

      console.log("start Date-->",startDate.toDate());
      console.log("end date--->",endDate.toDate());

    
    const condition=[
        {
          $unwind: "$chats"
        },
        {
          $match: {
            "chats.isCustomMessage": true
          }
        },
      
        {
          $group: {
            _id: {
              ticketId: "$_id",
              day: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt"
                }
              }
            },
            
            firstCustomMessageTime: {
              $first: "$chats.date"
            },
            createdAt: {
              $first: "$createdAt"
            }
          }
        },
        {
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              day: "$_id.day",
           
              firstCustomMessageTime: 1,
              ticketId: "$_id.ticketId",
              createdAt: 1
            }
        },
        {
          $group:
            /**
             * _id: The id of the group.
             * fieldN: The first field name.
             */
            {
              _id: "$day",
              count: {
                $sum: 1
              },
              avgFirstResponseTime: {
                $avg: {
                  $subtract: [
                    "$firstCustomMessageTime",
                    "$createdAt"
                  ]
                }
              }
            }
        }
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
                return res.status(404).json({
                    success: false,
                    message: "Product group not found",
                });
            }

            // Calculate overall average first response time across all days
            const overallAvgFirstResponseTime = group.reduce(
              (acc, curr) => {
                acc.totalAvgTime += curr.avgFirstResponseTime;
                acc.totalDays += 1;
                return acc;
              },
              { totalAvgTime: 0, totalDays: 0 }
            );
            
            const averageFirstResponseTime =
              overallAvgFirstResponseTime.totalDays > 0
                ? overallAvgFirstResponseTime.totalAvgTime / overallAvgFirstResponseTime.totalDays / 1000 / 60
                : null;

            // Convert avgFirstResponseTime from milliseconds to minutes for each day
            const processedGroup = group.map(item => ({
              ...item,
              avgFirstResponseTime: item.avgFirstResponseTime 
            }));

            processedGroup.sort((a, b) => a._id.localeCompare(b._id));

            return res.status(200).json({
                success: true,
                message: "Product group retrieved successfully",
                data: processedGroup,
                averageFirstResponseTime,
                
            });
        });

  } catch (err) {
    console.error("Ticket analytics error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

module.exports = [getTicketGraphData];
