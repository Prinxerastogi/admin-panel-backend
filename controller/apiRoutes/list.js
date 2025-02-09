const listEndpoints = require("express-list-endpoints");

//let apiRoutes = app.Router();

module.exports = (req, res) => {
    let endpoints = require("../../app");
    return res
        .status(200)
        .json({ success: true, message: "data found", routes: endpoints });
};
