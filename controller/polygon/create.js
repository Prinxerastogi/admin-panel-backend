"use strict";
const Polygon = require("../../sharedmb/schema/polygon");
const crypto = require("crypto");

const genId = () =>
    (crypto.randomUUID && crypto.randomUUID()) ||
    `poly_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const createPolygon = async (req, res) => {
    try {
        const payload = req.body || {};
        payload.id = payload.id || genId();

        if (
            !Array.isArray(payload.coordinates) ||
            payload.coordinates.length < 1
        ) {
            return res
                .status(400)
                .json({
                    error: "coordinates must be a non-empty array of [lat,lng]",
                });
        }

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
