"use strict";
const Polygon = require("../../sharedmb/schema/polygon");
const booleanPointInPolygon = require("@turf/boolean-point-in-polygon").default;
const { point, polygon: turfPolygon } = require("@turf/helpers");

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

        const all = await Polygon.find().sort({ createdAt: 1 }).lean();
        const pt = point([nlng, nlat]); // turf expects [lng, lat]

        let hit = null,
            index = null;

        for (let i = all.length - 1; i >= 0; i--) {
            const poly = all[i];
            const ring = (poly.coordinates || []).map(([la, lo]) => [lo, la]);

            if (!ring.length) continue;

            const first = ring[0],
                last = ring[ring.length - 1];
            if (!last || first[0] !== last[0] || first[1] !== last[1]) {
                ring.push([first[0], first[1]]);
            }

            const turfPoly = turfPolygon([ring]);
            if (booleanPointInPolygon(pt, turfPoly)) {
                hit = poly;
                index = i + 1; // 1-based
                break;
            }
        }

        if (!hit) return res.json({ hit: false });
        return res.json({ hit: true, index, polygon: hit });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to test point",
            details: String(err),
        });
    }
};

module.exports = testPoint;
