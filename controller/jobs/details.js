let jobSchema = require("../../sharedmb/schema/job");

const getAllJobs = async (req, res, next) => {
    try {
        let pipeline = [{ $match: { orderNo: Number(req.query.orderNo) } }];

        pipeline.push(
            {
                $lookup: {
                    from: "deliveryboys",
                    localField: "assignedPartner",
                    foreignField: "_id",
                    as: "partnerInfo",
                },
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    assignedPartner: 1,
                    partnerInfo: 1,
                    partnerName: { $arrayElemAt: ["$partnerInfo.name", 0] },
                    partnerPhoneNo: {
                        $arrayElemAt: ["$partnerInfo.phoneNo", 0],
                    },
                    completionTime: 1,
                    acceptedTime: 1,
                    pickupTime: 1,
                    PickupArrivalTime: 1,
                    DestinationArrivalTime: 1,
                    cancellationRequestTime: 1,
                    cancellationTime: 1,
                    amount: 1,
                    reasonForCancellation: 1,
                    id: 1,
                    distance: 1, // in meters
                    duration: 1, // in seconds
                    orderNo: 1,
                    orderId: 1,
                    type: 1,
                    created: 1,
                    bonus: 1,
                },
            }
        );

        const jobs = await jobSchema.aggregate(pipeline);
        console.log(jobs);
        if (jobs && jobs.length) {
            return res.status(200).json({
                success: true,
                message: "JOB LIST FOUND",
                job: jobs[0],
            });
        } else {
            return res
                .status(200)
                .json({ success: false, message: "NO JOBS FOUNd" });
        }
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: "INTERNAL SERVER ERROR" });
    }
};

module.exports = [getAllJobs];
