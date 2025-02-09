let config = require("config"); // get our config file

module.exports = [
    (req, res) => {
        res.send(
            "Hello! The API is at http://localhost:" + config.port + "/api"
        );
    },
];
