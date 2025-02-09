const cron = require("node-cron");
const marketingSchema = require("../sharedmb/schema/marketingCampaign");
const orderSchema = require("../sharedmb/schema/order");
const { scheduleJob } = require("node-schedule");
const { fchmod } = require("fs");

const setUpCronJobs = async () => {
    try {
        return;
        const campaigns = await marketingSchema.find();
        if (!campaigns.length) {
            console.log("campaigns not found");
            return;
        }
        cron.getTasks().forEach((task) => task.stop());
        campaigns.forEach((campaign) => {
            console.log(campaign);
            if (campaign.type === "repeat") {
                console.log(
                    "Setting up cron job for",
                    campaign.templateName,
                    "for everyday at",
                    campaign.time
                );
                cron.schedule(convertTimeToCron(campaign.time), async () => {
                    await sendMessages(campaign);
                });
            } else if (campaign.type === "one-time") {
                console.log(
                    "Setting up cron job for",
                    campaign.templateName,
                    "for one-time at",
                    campaign.time
                );
                const date = new Date(2024, 11, 12, 5, 20, 0);
                scheduleJob(date, async () => {
                    await sendMessages(campaign);
                });
            } else {
                console.log("Invalid campaign type", campaign.type);
            }
        });
    } catch (error) {
        console.log("Error in setUpCronJobs", error);
    }
};

const sendMessages = async (campaign) => {
    try {
        const data = await getCampaignData(campaign);
        console.log("Data for campaign", campaign.templateName, data?.length);
        data?.forEach(async (order) => {
            campaign.channel.forEach(async (channel) => {
                if (channel === "whatsapp") {
                    await sendWhatsappMessage(order.phoneNo, campaign);
                }
            });
        });
    } catch (error) {
        console.log("Error in sendMessages", error);
    }
};

const sendWhatsappMessage = async (phoneNo, campaign) => {
    const baseUrl = "https://api.growaasan.com/api/sendPosCommunication";
    const queryParams = new URLSearchParams({
        clietnId: "100139",
        authKey: process.env.growassan_whatsapp_authKey,
        communicationType: "2",
        waTemplateName: campaign.templateName,
        waTemplateLang: "en",
        country_code: "91",
        customerMobile: phoneNo,
        messageType: "image",
        mediaUrl: campaign.media_link,
    });

    const url = `${baseUrl}?${queryParams.toString()}`;
    // console.log(url);
    // const response = await fetch(url);
    // console.log(response);
};

const getCampaignData = async (campaign) => {
    try {
        const match = {};
        if (campaign.deviceType !== "all") {
            match.deviceType = { $in: campaign.deviceType };
        }
        const noOfDays = 4;
        const startingDate = new Date(
            Date.now() - noOfDays * 24 * 60 * 60 * 1000
        );
        startingDate.setHours(0, 0, 0, 0);
        const endingDate = new Date(
            Date.now() - (noOfDays - 1) * 24 * 60 * 60 * 1000
        );
        endingDate.setHours(0, 0, 0, 0);
        const pipeline = [
            {
                $match: {
                    status: campaign.orderStatus,
                    deliveryDate: {
                        $gte: startingDate,
                        $lt: endingDate,
                    },
                    nthOrder: {
                        $gt: campaign.minOrderCount,
                        $lt: campaign.maxOrderCount,
                    },
                    amount: {
                        $gte: campaign.minOrderAmount,
                        $lt: campaign.maxOrderAmount,
                    },
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    { $size: "$product" },
                                    campaign.minProductQuantity,
                                ],
                            },
                            {
                                $lt: [
                                    { $size: "$product" },
                                    campaign.maxProductQuantity,
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "address",
                },
            },
            {
                $unwind: "$users",
            },
            {
                $project: {
                    phoneNo: "$users.phoneNo",
                    name: "$address.name",
                    fcmToken: "$users.fcmToken",
                },
            },
        ];

        const orders = await orderSchema.aggregate(pipeline);
        return orders;
    } catch (error) {
        console.log("Error in getCampaignData", error);
    }
};

const convertTimeToCron = (time) => {
    return `${(parseInt(time.split(":")[1]) + 30) % 60} ${
        (parseInt(time.split(":")[0]) +
            5 +
            parseInt((parseInt(time.split(":")[1]) + 30) / 60)) %
        24
    } * * *`;
};

module.exports = setUpCronJobs;
