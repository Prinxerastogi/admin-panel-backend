let crudModel = require("../../sharedmb/models/crud"),
    smartListSchema = require("../../sharedmb/schema/smartList"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let deleteSmartList = (req, res, next) => {
    let conditions = {
        _id: req.params.smartlist_id,
    };

    console.log(conditions);

    smartListSchema.deleteOne(conditions, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "Error occurred while deleting SmartList",
                error: err,
            });
        } else if (response.deletedCount > 0) {
            return res.status(200).json({
                success: true,
                message: `SmartList deleted successfully.`,
                data: response,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "SmartList not found",
            });
        }
    });
};

module.exports = [deleteSmartList];
