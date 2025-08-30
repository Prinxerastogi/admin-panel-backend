"use strict";
const Polygon = require("../../sharedmb/schema/polygon");

const updatePolygon = async (req, res) => {
    try {
        console.log("Updating polygon with ID:", req.params.id, req.body);
        let updates = req.body || {};

        if (updates.geometry) {
            let ring = req.body.geometry.coordinates[0] || [];

            if (ring.length > 0) {
                const [firstLng, firstLat] = ring[0];
                const [lastLng, lastLat] = ring[ring.length - 1];
                if (firstLng !== lastLng || firstLat !== lastLat) {
                    ring.push([firstLng, firstLat]);
                }
            }

            updates = {
                ...updates,
                geometry: {
                    type: "Polygon",
                    coordinates: [ring],
                },
            };
        }
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
