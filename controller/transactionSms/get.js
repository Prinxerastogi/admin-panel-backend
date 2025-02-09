let request = require("needle");
let config = require("config");
const url = `${config.bulkMSG.getcheckMesageUrl}username=${config.bulkMSG.username}&apikey=${config.bulkMSG.apiKey}`;

module.exports = [
    (req, res) => {
        request.get(url, function (err, response) {
            console.log(err);
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "somethig went wrong to get sms data",
                    err,
                });
            } else {
                response = JSON.parse(response.body).map((_, i) => {
                    if (_) {
                        return _;
                    } else {
                        return [];
                    }
                });
                return res.status(200).json({
                    success: true,
                    message: "data found",
                    smsData: response[0],
                });
            }
        });
    },
];
