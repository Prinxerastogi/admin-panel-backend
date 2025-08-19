"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const getPolygonById = async (req, res) => {
    try {
        const doc = await Polygon.findOne({ id: req.params.id }).lean();
        if (!doc) return res.status(404).json({ error: "Polygon not found" });
        return res.json(doc);
    } catch (err) {
        return res.status(500).json({
            error: "Failed to fetch polygon",
            details: String(err),
        });
    }
};

module.exports = getPolygonById;
