let infoPageSchema = require("../../sharedmb/schema/infoPage");

let detailInfoPage = (req, res) => {
    let condition = {
        id: req.params.id,
    };
    infoPageSchema.findOne(condition, (err, response) => {
        if (err) {
            return res.status(400).json({
                message: "error in matching info page",
                success: false,
                error: err,
            });
        } else if (response) {
            return res.status(201).json({
                message: "info page found",
                success: true,
                data: response,
            });
        } else {
            return res
                .status(200)
                .json({ message: "info page not found", success: false });
        }
    });
};

module.exports = [detailInfoPage];
