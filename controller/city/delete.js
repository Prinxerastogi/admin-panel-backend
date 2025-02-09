let citySchema = require("../../sharedmb/schema/city");

let deleteCity = (req, res) => {
    let condition = {
        _id: req.params.id,
    };

    citySchema.updateOne(condition, { isDeleted: true }, (err, response) => {
        if (err) {
            res.status(400).json({ err: true, message: err.message });
        } else if (response.nModified > 0) {
            res.status(200).json({
                success: true,
                message: "City deleted successfully",
            });
        } else {
            res.status(200).json({
                success: false,
                message: "unable to delete city",
            });
        }
    });
};

module.exports = [deleteCity];
