"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const testPoint = async (req, res) => {
    try {
        const { lat, lng } = req.body || {};
        const nlat = Number(lat);
        const nlng = Number(lng);

        if (!Number.isFinite(nlat) || !Number.isFinite(nlng)) {
            return res
                .status(400)
                .json({ error: "lat and lng must be valid numbers" });
        }

        const hit = await Polygon.findOne({
            geometry: {
                $geoIntersects: {
                    $geometry: {
                        type: "Point",
                        coordinates: [nlng, nlat], // always [lng, lat]
                    },
                },
            },
        }).lean();

        if (!hit) return res.json({ hit: false });
        return res.json({ hit: true, polygon: hit });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to test point",
            details: String(err),
        });
    }
};

module.exports = testPoint;
