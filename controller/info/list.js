let infoPageSchema = require("../../sharedmb/schema/infoPage");

let getInfoPageList = (req, res, next) => {
    let aggregate = [
        {
            $match: {
                isDelete: false,
            },
        },
        {
            $sort: {
                _id: -1,
            },
        },
        {
            $project: {
                title: 1,
                appUrL: "$title",
                webUrL: "$title",
                isActive: 1,
                id: 1,
            },
        },
    ];

    infoPageSchema.aggregate(aggregate, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "error in matching info page",
                success: false,
                error: err,
            });
        } else if (response.length > 0) {
            return res.status(200).json({
                message: response.length + " info pages found.",
                success: true,
                infoPage: response,
            });
        } else {
            return res
                .status(200)
                .json({ message: "info pages not found.", success: false });
        }
    });
};

module.exports = [getInfoPageList];
