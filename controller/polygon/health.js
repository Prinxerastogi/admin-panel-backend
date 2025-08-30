"use strict";

const health = async (req, res) => {
    try {
        return res.json({
            success: true,
            message: "Welcome to polygon API v1",
        });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to check health",
            details: String(err),
        });
    }
};

module.exports = health;
