let crudModel = require("../../sharedmb/models/crud"),
    smartListSchema = require("../../sharedmb/schema/smartList"),
    mongoose = require("mongoose"),
    MESSAGE = require("./message");

let findSmartList = (req, res, next) => {
    let conditions = {};
    crudModel.find(conditions, smartListSchema, (err, smartLists) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: MESSAGE.add.error,
                error: err,
            });
        } else if (smartLists != null) {
            return res.status(200).json({
                success: true,
                message: `SmartList Data`,
                data: smartLists,
            });
        } else {
            return res.status(500).json({
                success: true,
                message: MESSAGE.add.unknown,
            });
        }
    });
};

module.exports = [findSmartList];