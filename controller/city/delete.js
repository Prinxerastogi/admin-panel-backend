let citySchema = require("../../sharedmb/schema/city");
const crudModel = require("../../sharedmb/models/crud");

let deleteCity = (req, res) => {
    let condition = {
        _id: req.params.id,
    };

    crudModel.updateOne(
        condition,
        { isDeleted: true },
        citySchema,
        (err, response) => {
            if (err) {
                res.status(400).json({ err: true, message: err.message });
            } else if (response.modifiedCount > 0) {
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
        }
    );
};

module.exports = [deleteCity];
