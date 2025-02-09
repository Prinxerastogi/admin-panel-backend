const axios = require("axios");
const config = require("../../config/development.json");
const crypto = require("crypto");

const getDetails = async (req, res, next) => {
    try {
        const toHash = `${process.env.wireKey}|${process.env.wireSalt}`;
        const auth = crypto.createHash("sha512").update(toHash).digest("hex");
        const options = {
            method: "GET",
            url: "https://wire.easebuzz.in/api/v1/virtual_accounts/",
            params: { key: process.env.wireKey },
            headers: {
                Authorization: auth,
                "WIRE-API-KEY": process.env.wireKey,
                Accept: "application/json",
            },
        };

        const { data } = await axios.request(options);
        if (data.success) {
            return res.json({
                success: true,
                data: data.data.virtual_accounts[0],
            });
        } else {
            return res.json({
                success: false,
                message: "unable to fetch",
                responsse: data,
            });
        }
    } catch (error) {
        console.error("error in getting bank details", error);
        return res.json({ success: false, message: "unable to fetch", error });
    }
};

module.exports = [getDetails];
