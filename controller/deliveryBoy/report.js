const deliveryBoySchema = require("../../sharedmb/schema/deliveryBoy");
const deliveryBoyTransactionSchema = require("../../sharedmb/schema/deliveryBoyTransactions");
const deliveryBoyLogsSchema = require("../../sharedmb/schema/deliveryBoyLogs");
const { DlogTypes } = require("../../sharedmb/models/logTypes");
const { Types } = require("mongoose");

const getDeliveryBoyReport = async (req, res, next) => {
    try {
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : new Date();
        endDate.setHours(23, 59, 59, 999);

        let deliveryBoys = await deliveryBoySchema.find(
            { isVerified: true, },
            { _id: 1, phoneNo: 1, name: 1, bikeRented:1}
        );

        const getTransactions = async (deliveryBoy) => {
            let transactions = await deliveryBoyTransactionSchema.aggregate([
                {
                    $match: {
                        created: { $gte: startDate, $lte: endDate },
                        deliveryPartnerId: deliveryBoy._id,
                        type: "credit",
                        remarks: {$in: ["Earning" , "Route Earning"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: "$amount" }, 
                    },
                },
            ]);

         // Calculate attendance and online time
         let attendance = await calculateAttendance(deliveryBoy._id, startDate, endDate);

         return {
             ...deliveryBoy.toObject(),
             currentBalance: transactions.length ? transactions[0].totalBalance : 0,
             attendance  
         };
     };

        let result = await Promise.all(deliveryBoys.map(getTransactions));

        return res.json({
            data: result,
            success: true,

        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

const calculateAttendance = async (id, startDate, endDate) => {
    try {
        const result = await deliveryBoyLogsSchema.aggregate([
            {
                $match: {
                    deliveryPartnerId: new Types.ObjectId(id),
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $sort: { createdAt: 1 },
            },
            {
                $addFields: {
                    createdDate: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "+05:30",
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$createdDate",
                    logs: {
                        $push: {
                            type: "$type",
                            createdAt: "$createdAt",
                            message: "$message",
                            admin: {
                                $cond: {
                                    if: { $eq: ["$admin", null] },
                                    then: false,
                                    else: "$admin",
                                },
                            },
                            jobId: "$jobId",
                            routeId: "$routeId",
                        },
                    },
                },
            },
        ]);

        const attendance = result.map((item) => {
            if (item.logs.length > 0) {
                item.onlineTime = calculateOnlineTime(item.logs).onlineTime;
                delete item.logs;
            }
            return { date: item._id, onlineTime: item.onlineTime };
        });
        return attendance;
    } catch (err) {
        console.log(err);
    }
};

const formatOnlineTime = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) return "0 mins";
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs > 0 ? `${hrs} hour${hrs > 1 ? "s" : ""} ` : ""}${mins} min${mins > 1 ? "s" : ""}`;
};

const calculateOnlineTime = (logs) => {
    let onlineTime = 0;
    let offlineTime = 0;
    let lastOnlineTime = null;
    let lastOfflineTime = null;
    let lastStatus = "offline";
    let lastLog = null;
    let noOfOrdersCompleted = 0;
    const offlineTypeArr = [
        DlogTypes.auto_offline_from_online,
        DlogTypes.auto_offline_from_returning,
        DlogTypes.offline,
    ];
    logs.forEach((log) => {
        if (log.type === DlogTypes.online) {
            lastOnlineTime = new Date(log.createdAt);
            if (lastLog && offlineTypeArr.includes(lastLog.type)) {
                offlineTime += lastOnlineTime - new Date(lastLog.createdAt);
            }
            lastLog = log;
        } else if (offlineTypeArr.includes(log.type)) {
            lastOfflineTime = new Date(log.createdAt);
            if (lastLog && lastLog.type === DlogTypes.online) {
                onlineTime += lastOfflineTime - new Date(lastLog.createdAt);
            }
            lastLog = log;
        } else if (log.type === DlogTypes.job_complete) {
            noOfOrdersCompleted++;
        }
    });

    return {
        onlineTime: formatOnlineTime(onlineTime),
        offlineTime,
        lastOnlineTime,
        lastOfflineTime,
        lastStatus,
        lastLog,
        noOfOrdersCompleted,
    };
};

module.exports = [getDeliveryBoyReport];
