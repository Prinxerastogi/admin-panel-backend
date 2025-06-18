const { sendNotification } = require("../../sharedmb/utility/utility");

const FCM_DEVICE_TOKEN =
    "dYBoPb5oDE5KgvNdnFqnCK:APA91bE7uxFQM12l7gsaXq9bbHVB1Sm1tb7NzTPQ5CMsfsiJMBSgv7moJBE4Lc3qHyb2rhiY12TLWdw2UjwbDEsQWlJ3jZLmjJZb-oaMftvALc1mcePaKwc";

module.exports = async (req, res, next) => {
    try {
        console.log("Incoming payload:", req.body);

        // Parse payload if it's a string (GitHub sends as form data sometimes)
        const payload =
            typeof req.body.payload === "string"
                ? JSON.parse(req.body.payload)
                : req.body.payload || req.body;

        const eventType =
            req.headers["x-github-event"] ||
            (payload.workflow_run
                ? "workflow_run"
                : payload.commits
                ? "push"
                : "unknown");

        let message = null;

        if (eventType === "workflow_run") {
            const { workflow_run, repository } = payload;
            if (workflow_run?.status === "completed") {
                message = {
                    notification: {
                        title: `✅ Workflow: ${workflow_run.name}`,
                        body: `Status: ${workflow_run.conclusion.toUpperCase()} — ${
                            repository.full_name
                        }`,
                    },
                    token: FCM_DEVICE_TOKEN,
                };
            }
        } else if (eventType === "push") {
            const { pusher, commits, repository, ref } = payload;
            message = {
                notification: {
                    title: `📦 Push to ${repository.full_name}`,
                    body: `${pusher.name} pushed ${
                        commits.length
                    } commit(s) to ${ref.replace("refs/heads/", "")}`,
                },
                token: FCM_DEVICE_TOKEN,
            };
        } else {
            console.warn("Unhandled GitHub event type:", eventType);
        }

        if (message) {
            const response = await sendNotification(message); // await if it's a promise
            console.log("FCM message sent:", response);
        } else {
            console.log(
                "No notification sent. Either event type unhandled or condition not met."
            );
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error in GitHub webhook handler:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
