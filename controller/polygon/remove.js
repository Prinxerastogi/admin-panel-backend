"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const deletePolygon = async (req, res) => {
    try {
        const doc = await Polygon.findOneAndDelete({ id: req.params.id });
        if (!doc) return res.status(404).json({ error: "Polygon not found" });
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to delete polygon",
            details: String(err),
        });
    }
};

module.exports = deletePolygon;
