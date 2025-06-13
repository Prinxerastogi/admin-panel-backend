const { sendNotification } = require("../../sharedmb/utility/utility");
const FCM_DEVICE_TOKEN =
    "dYBoPb5oDE5KgvNdnFqnCK:APA91bE7uxFQM12l7gsaXq9bbHVB1Sm1tb7NzTPQ5CMsfsiJMBSgv7moJBE4Lc3qHyb2rhiY12TLWdw2UjwbDEsQWlJ3jZLmjJZb-oaMftvALc1mcePaKwc";

module.exports = async (req, res, next) => {
    try {
        console.log(req.body);
        const { action, repository, workflow_run } =
            typeof req.body.payload === "string"
                ? JSON.parse(req.body.payload)
                : req.body.payload;

        // Example condition: Only trigger on workflow_run completion
        // if (workflow_run?.status === "completed") {
        const message = {
            notification: {
                title: `GitHub Workflow: ${workflow_run.name}`,
                body: `Status: ${workflow_run.conclusion.toUpperCase()} for ${
                    repository.full_name
                }`,
            },
            token: FCM_DEVICE_TOKEN,
        };

        const response = sendNotification(message);
        console.log("FCM message sent:", response);
        // }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error in webhook handler:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
