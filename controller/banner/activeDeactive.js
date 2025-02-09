let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/banner");

let updateAttribute = (req, res) => {
    let conditions = {
        _id: req.body.bannerId,
    };
    let update = {
        $set: {
            isActive: Boolean(req.body.value),
        },
    };
    let options = {};
    crud.updateOne(conditions, update, options, schema, (error, response) => {
        if (error)
            return res
                .status(400)
                .json({ success: false, message: "error ", error: error });
        else if (response.nModified == 1)
            return res.status(200).json({
                success: true,
                message: "updated successfully",
                response,
            });
        else
            return res
                .status(201)
                .json({ success: false, message: "something went wrong" });
    });
};

module.exports = [updateAttribute];
