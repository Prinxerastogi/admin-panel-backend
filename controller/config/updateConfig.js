const configSchema = require("../../sharedmb/schema/config");
const orderSchema = require("../../sharedmb/schema/order");
const axios = require("axios");

const cron = require("node-cron");

module.exports = async (req, res) => {
    try {
        console.log(req.body);
        const updatedConfig = await configSchema.findOneAndUpdate({}, req.body);
        let isValid = true;
        req.body.whatsapp_campaign_details.forEach((campaign) => {
            if (!cron.validate(convertTimeToCron(campaign.time))) {
                console.log(convertTimeToCron(campaign.time));
                isValid = false;
            }
        });
        if (!isValid) {
            return res.json({
                message: "Invalid time",
                success: false,
            });
        }
        if (updatedConfig) {
            res.json({
                message: "Config updated successfully",
                success: true,
                config: updatedConfig,
            });
            cron.getTasks().forEach((task) => task.stop());

            updatedConfig.whatsapp_campaign_details.forEach((campaign) => {
                cron.schedule(convertTimeToCron(campaign.time), async () => {
                    await sendWhatsappMessageToOrderDelivered1DayAgo(campaign);
                });
            });
        } else {
            return res.json({
                message: "Config not updated",
                success: false,
            });
        }
    } catch (error) {
        console.log("Error in updateConfig", error);
        return res.json({
            message: "Config not updated",
            success: false,
        });
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

const sendWhatsappMessageToOrderDelivered1DayAgo = async (campaign) => {
    const orders = await orderSchema.aggregate([
        {
            $match: {
                status: "delivered",
                deliveryDate: {
                    $gte: new Date(
                        new Date().setDate(new Date().getDate() - 1)
                    ),
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
    ]);

    const phoneNos = orders.map((order) => order.user.phoneNo);

    phoneNos.forEach(async (phoneNo) => {
        console.log("sending whatsapp message to ", phoneNo);
        // const url = `https://api.growaasan.com/api/sendPosCommunication?clietnId=${process.env.whatsappBuisnessId}&authKey=${process.env.whatsappAuthKey}&communicationType=2&waTemplateName=${campaign.templateName}&waTemplateLang=en&country_code=91&customerMobile=${phoneNo}&varCount=1&var1=${otp}`;
        // const response = await axios.get(url);
    });
};

// cron.getTasks().forEach((task) => task.);
