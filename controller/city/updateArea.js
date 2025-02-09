let crudModel = require("../../sharedmb/models/crud");
let citySchema = require("../../sharedmb/schema/city");

let getArea = (req, res) => {
    console.log(req.body);

    res.json({ response: req.body });
};

module.exports = [getArea];
