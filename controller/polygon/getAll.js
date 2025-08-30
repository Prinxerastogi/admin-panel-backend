"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const getAllPolygons = async (req, res) => {
    try {
        let variant = req.query.variant || "deliveryCost";
        const docs = await Polygon.find({ variant: variant })
            .sort({ createdAt: 1 })
            .lean();
        return res.json(docs);
    } catch (err) {
        return res.status(500).json({
            error: "Failed to list polygons",
            details: String(err),
        });
    }
};

module.exports = getAllPolygons;
