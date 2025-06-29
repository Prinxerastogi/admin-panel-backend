
const mongoose = require("mongoose");
const ReportIssue = require("../../sharedmb/schema/reportIssue");

const createIssue = async (req, res) => {
    try {
        const {
            orderId,
            productId,
            description,
            userId,
            issue,
            email,
            phoneNo,
            type,
        } = req.body;

        if (!description || !issue) {
            return res.status(400).json({
                error: true,
                message: "Description and issue are required fields",
            });
        }

        const issueData = {
            description: description,
            issue: issue,
            created: Date.now(),
            updated: Date.now(),
            date: new Date(),
            status: "new",
            type: type || "general",
        };

        if (orderId) issueData.orderId =orderId;
        if (productId)
            issueData.productId = Array.isArray(productId)
                ? productId
                : [productId];
        if (userId) issueData.userId = mongoose.Types.ObjectId(userId);
        if (email) issueData.email = email;
        if (phoneNo) issueData.phoneNo = phoneNo;

        const newIssue = new ReportIssue(issueData);
        await newIssue.save();

        const populatedIssue = await ReportIssue.findById(newIssue._id)
            .populate("userId", null, "users")
            .lean();

        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            issue: populatedIssue,
        });
    } catch (error) {
        console.error("Error creating issue:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = [createIssue];
