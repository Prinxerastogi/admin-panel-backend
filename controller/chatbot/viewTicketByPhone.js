const userSchema = require("../../sharedmb/schema/user"); 
const ticketSchema = require("../../sharedmb/schema/ticket");

const viewTicketByPhone = async (req, res) => {
    try {
        console.log("Request received:", req.query);

        if (!req.query.phoneNo) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const phoneNumber = req.query.phoneNo.toString().replace(/\D/g, '');
        console.log("Cleaned phone number:", phoneNumber);

        if (phoneNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid 10-digit phone number",
            });
        }

        // Step 1: Find userId from phone number
        const user = await userSchema.findOne({
            phoneNo: Number(phoneNumber)
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user found with this phone number",
            });
        }

        console.log("User found:", user);

        // Step 2: Use user._id to find tickets
        const tickets = await ticketSchema.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(1);

        if (tickets.length > 0) {
            return res.status(200).json({
                success: true,
                tickets: tickets[0],
                message: "Ticket found",
            });
        }

        return res.status(200).json({
            success: false,
            message: "No tickets found for this user",
        });

    } catch (err) {
        console.error("Search error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = viewTicketByPhone;