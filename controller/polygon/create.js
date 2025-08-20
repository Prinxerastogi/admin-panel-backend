"use strict";
const Polygon = require("../../sharedmb/schema/polygon");
const crypto = require("crypto");

const genId = () =>
    (crypto.randomUUID && crypto.randomUUID()) ||
    `poly_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const createPolygon = async (req, res) => {
    try {
        const id = req.body.id || genId();
        const { geometry, colorCode, basePrice, bonus } = req.body || {};

        if (
            !geometry ||
            geometry.type !== "Polygon" ||
            !Array.isArray(geometry.coordinates)
        ) {
            return res
                .status(400)
                .json({ error: "geometry must be a valid GeoJSON Polygon" });
        }

        let ring = geometry.coordinates[0] || [];

        // ✅ Ensure polygon loop is closed
        if (ring.length > 0) {
            const [firstLng, firstLat] = ring[0];
            const [lastLng, lastLat] = ring[ring.length - 1];
            if (firstLng !== lastLng || firstLat !== lastLat) {
                ring.push([firstLng, firstLat]);
            }
        }

        const payload = {
            id,
            colorCode: colorCode || "#000000",
            geometry: {
                type: "Polygon",
                coordinates: [ring],
            },
            config: {
                basePrice: basePrice || 0,
                bonus: {
                    active: bonus?.active ?? false,
                    amount: bonus?.amount ?? 0,
                },
            },
        };

        const created = await Polygon.create(payload);
        return res.json(created);
    } catch (err) {
        return res.status(500).json({
            error: "Failed to create polygon",
            details: String(err),
        });
    }
};

module.exports = createPolygon;
