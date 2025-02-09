let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/cashRequest");

let list = (req, res) => {
    let condition = { status: null };
    if (req.query.status == null || req.query.status == undefined) {
        return res
            .status(201)
            .json({ success: false, message: "invalid query parameter" });
    }
    if (req.query.status == "new") {
        condition.status = "new";
    }
    if (req.query.status == "accepted") {
        condition.status = "accepted";
    }
    if (req.query.status == "redeem") {
        condition.status = "redeem";
    }
    if (req.query.status == "cancel") {
        condition.status = "cancel";
    }
    crud.find(condition, schema, (err, list) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in find cashrequest list",
                err,
            });
        }
        if (list && list.length > 0) {
            return res
                .status(200)
                .json({ success: true, message: "list found", list: list });
        }
        return res
            .status(201)
            .json({ success: false, message: "no list found" });
    });
};
module.exports = [list];
