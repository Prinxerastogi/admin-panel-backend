let crudModel = require("../../sharedmb/models/crud");
let societySchema = require("../../sharedmb/schema/society");

let getArea = (req, res) => {
    res.json({ response: req.body });
};

module.exports = [getArea];
