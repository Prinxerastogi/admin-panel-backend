"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const updatePolygon = async (req, res) => {
    try {
        const updates = req.body || {};
        const doc = await Polygon.findOneAndUpdate(
            { id: req.params.id },
            updates,
            { new: true, runValidators: true }
        );

        if (!doc) return res.status(404).json({ error: "Polygon not found" });
        return res.json(doc);
    } catch (err) {
        return res.status(500).json({
            error: "Failed to update polygon",
            details: String(err),
        });
    }
};

module.exports = updatePolygon;
