"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const testPoint = async (req, res) => {
    try {
        const { lat, lng, variant } = req.body || {};
        const nlat = Number(lat);
        const nlng = Number(lng);

        if (!Number.isFinite(nlat) || !Number.isFinite(nlng)) {
            return res
                .status(400)
                .json({ error: "lat and lng must be valid numbers" });
        }
        let finalVariant = "deliveryCost";
        if (variant) finalVariant = variant;

        const hit = await Polygon.findOne(
            {
                variant: finalVariant,
                geometry: {
                    $geoIntersects: {
                        $geometry: {
                            type: "Point",
                            coordinates: [nlng, nlat], // always [lng, lat]
                        },
                    },
                },
            },
            {
                _id: 1,
                id: 1,
                config: 1,
            }
        ).lean();

        if (!hit)
            return res.json({ success: false, message: "No Polygon Found" });
        return res.json({
            success: true,
            message: "Polygon Found",
            polygon: hit,
        });
    } catch (err) {
        return res.status(500).json({
            error: "Failed to test point",
            details: String(err),
        });
    }
};

module.exports = testPoint;
