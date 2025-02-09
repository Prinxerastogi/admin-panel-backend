let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/setting");

let add = (req, res) => {
    if (!req.body.name) {
        return res
            .status(201)
            .json({ success: false, message: "please enter name " });
    }
    if (!req.body.value) {
        return res
            .status(201)
            .json({ success: false, message: "please enter value " });
    }
    let now = new Date();
    let data = {
        deliveryCharges: Number(req.body.deliveryCharges),
        minimumOrderValue: Number(req.body.minimumOrderValue),
        created: now.getTime(),
        updated: now.getTime(),
        date: now,
    };

    crud.create(data, schema, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "error occured in add setting",
                error: err,
            });
        } else if (response == null) {
            return res
                .status(202)
                .json({ success: false, message: "values are not saved" });
        } else {
            return res.status(200).json({
                success: true,
                message: " values successfully added",
                response: response,
            });
        }
    });
};

module.exports = [add];
