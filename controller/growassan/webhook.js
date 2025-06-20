const webhookSchema = require("../../sharedmb/schema/webhook");

const main = async (req, res, next) => {
    try {
        const webhook = new webhookSchema({
            data: req.body,
        });

        await webhook.save()

        console.log(webhook)
        if (!webhook) {
            throw Error("CANNOT SAVE WEBhook");
        }
        res.status(200).json({ success: true, message: "Recieved" });
    } catch (err) {
        console.error("error in growassan webhook", err);
        return res
            .status(500)
            .json({ success: false, message: "INTERNAL SERVER ERROR" });
    }
};

module.exports = main;
