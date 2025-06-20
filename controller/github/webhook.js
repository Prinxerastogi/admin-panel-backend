const { sendNotification } = require("../../sharedmb/utility/utility");

const FCM_DEVICE_TOKEN =
    "dYBoPb5oDE5KgvNdnFqnCK:APA91bGqgmC_xSOW3ITYpnibKf6Z6iMEuOtoLZMSgOHo0QTw-99F-H0OEPP2NfZZ68CYcYb-KlsQslsqHEcWInt181UCMQ-Jo6mLvtCzCbxroBOKVzONx4Y";

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
