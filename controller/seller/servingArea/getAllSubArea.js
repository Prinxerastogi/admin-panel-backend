let serveAreaSchema = require("../../../sharedmb/schema/servingArea");

let allSubServeAreas = (req, res) => {
    let condition = [
        {
            $unwind: {
                path: "$servingAreas",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$servingAreas._id",
                areaName: { $first: "$servingAreas.areaName" },
                cityId: { $first: "$cityId" },
            },
        },
    ];
    serveAreaSchema.aggregate(condition, (err, areas) => {
        if (err) {
            res.status(400).json({ err: true, message: err.message });
        } else if (areas.length > 0) {
            res.status(200).json({
                success: true,
                message: "serve area found",
                areas,
            });
        } else {
            res.status(200).json({ success: false, message: "no area found" });
        }
    });
};

module.exports = [allSubServeAreas];
