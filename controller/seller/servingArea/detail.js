let serveAreaSchema = require("../../../sharedmb/schema/servingArea");
let mongoose = require("mongoose");

let serveAreaDetail = (req, res) => {
    let condition = [
        {
            $unwind: {
                path: "$servingAreas",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $match: {
                "servingAreas._id": mongoose.Types.ObjectId(req.params.id),
            },
        },
    ];

    serveAreaSchema.aggregate(condition, (err, data) => {
        if (err) {
            res.status(400).json({ err: true, message: err.message });
        } else if (data.length > 0) {
            res.status(200).json({
                success: true,
                message: "Area found",
                data: data[0],
            });
        } else {
            res.status(200).json({ success: false, message: "no area found" });
        }
    });
};

module.exports = [serveAreaDetail];
