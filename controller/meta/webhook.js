const VERIFY_TOKEN = "6eNqkh6R77£X"; // replace with your actual token

const main = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified successfully");
        return res.status(200).send(challenge); // Must send the challenge back
    } else {
        console.log("❌ Webhook verification failed");
        return res.sendStatus(403); // Forbidden
    }
}

module.exports = [main]