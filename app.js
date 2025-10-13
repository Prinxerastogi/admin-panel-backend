const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
let config = require("config");
const listEndpoints = require("express-list-endpoints");
require("dotenv").config();
const GOOGLE_MAPS_API_KEY = "AIzaSyC-smWaXJTSXppHww8X_k5_VYZnWDD6QSs";
let Schema = mongoose.Schema;
const { default: axios } = require("axios");
// const setUpCronJobs = require("./library/whatsappCampaign");

app.use(cors());
mongoose.connect(config.database, {
    socketTimeoutMS: 0,
});
console.log("MongoDb Connection: ", config.database);

mongoose.connection.on("connected", function () {
    console.log("Mongoose default connection open to " + config.database);
});

// If the connection throws an error
mongoose.connection.on("error", function (err) {
    console.log("Mongoose default connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function () {
    console.log("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function () {
    mongoose.connection.close(function () {
        console.log(
            "Mongoose default connection disconnected through app termination"
        );
        process.exit(0);
    });
});

if (config.port == 13002 && process.env.NODE_ENV === "default") {
    mongoose.set("debug", true);
}

const userSchema = new Schema({
    name: { type: String, lowercase: true },
    phoneNo: Number,
    email: { type: String, lowercase: true },
    address: [
        {
            area: { type: String, lowercase: true },
            street: { type: String, lowercase: true },
            city: { type: String, lowercase: true },
            country: { type: String, lowercase: true },
            state: { type: String, lowercase: true },
            district: { type: String, lowercase: true },
            fullAddress: { type: String, lowercase: true },
            latitude: Number,
            longitude: Number,
            pincode: { type: String },
            line1: { type: String, lowercase: true },
            line2: { type: String, lowercase: true },
            locality: { type: String, lowercase: true },
            mobileNo: Number,
            name: { type: String, lowercase: true },
            neighbourhood: { type: String, lowercase: true },
            route: {},
            type: { type: String, lowercase: true },
            location: {},
            isDefault: { type: Boolean, default: false },
            status: {
                type: String,
                enum: ["correct", "incorrect", "cannotdecide", null],
                default: null,
            },
            created: Number,
            updated: Number,
        },
    ],
});

// Create the User model
const User = mongoose.model("User", userSchema);

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    console.log(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

app.use(
    "/api/admin/public/product",
    express.static(config.upload.productImagePath)
);
app.use(
    "/api/admin/public/brand",
    express.static(config.upload.brandImagePath)
);
app.use(
    "/api/admin/public/cat",
    express.static(config.upload.categoryImagePath)
);
app.use(
    "/api/admin/public/notification",
    express.static(config.upload.notifiactionImagePath)
);
app.use(
    "/api/admin/public/membership",
    express.static(config.upload.memberShipImagePath)
);
app.use(
    "/api/admin/public/customImages",
        express.static(config.upload.customImages)
);
app.use("/api/admin/public/city", express.static(config.upload.cityImagePath));
app.use("/api/admin/public/blog", express.static(config.upload.blogImagePath));
app.use("/api/admin/public/banner", express.static(config.upload.banner));
app.use(
    "/api/admin/public/supplier",
    express.static(config.upload.supplierImagePath)
);
app.use("/api/admin/public/info", express.static(config.upload.infoImagePath));
app.use("/api/admin/public/temp", express.static(config.upload.tempPath));

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "100mb" }));
app.use(
    express.urlencoded({
        limit: "100mb",
        extended: true,
        parameterLimit: 50000,
    })
);
// mongoose.set("useCreateIndex", true);
app.get("/socket.io", (req, res) => {
    console.log("Headers:", req.headers);
    res.status(404).send("Not Found");
});

app.use(morgan("dev"));

/**
 * 📌 GET /api/address
 * Fetches addresses with latitude, longitude and unverified status
 */
app.get("/api/address", async (req, res) => {
    try {
        const users = await User.aggregate([
            { $unwind: "$address" },
            {
                $match: {
                    "address.latitude": { $ne: null, $gte: 28, $lte: 29 },
                    "address.longitude": { $ne: null },
                    "address.status": {
                        $nin: ["correct", "incorrect", "cannotdecide"],
                    },
                },
            },
            {
                $project: {
                    _id: "$address._id",
                    userId: "$_id",
                    name: "$name",
                    phoneNo: "$phoneNo",
                    address: "$address",
                },
            },
            {
                $sample: { size: 1 },
            },
        ]);
        console.log(users.length);

        if (users.length === 0) {
            return res.status(404).json({
                message: "No matching addresses found",
                success: false,
            });
        }

        res.json({
            address: {
                userId: users[0].userId,
                _id: users[0].address._id,
                userAddress: `${users[0].address.line1} ${users[0].address.line2} ${users[0].address.fullAddress}`,
                geoAddress: await reverseGeocode(
                    users[0].address.latitude,
                    users[0].address.longitude
                ),
                latitude: users[0].address.latitude,
                longitude: users[0].address.longitude,
            },
            success: true,
        });
    } catch (err) {
        console.error("Error fetching user addresses:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
});

/**
 * 📌 POST /api/address/:userId/:addressId
 * Updates an address status to "correct", "incorrect", or "cannotdecide"
 */
app.post("/api/address/:userId/:addressId", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["correct", "incorrect", "cannotdecide"].includes(status)) {
            return res
                .status(400)
                .json({ message: "Invalid status value", success: false });
        }

        const result = await User.updateOne(
            { _id: req.params.userId, "address._id": req.params.addressId },
            { $set: { "address.$.status": status } }
        );

        if (result.matchedCount === 0) {
            return res
                .status(404)
                .json({ message: "User or address not found", success: false });
        }

        res.json({ message: `Address updated to ${status}`, success: true });
    } catch (err) {
        console.error("Error updating address status:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
});

async function reverseGeocode(lat, lon) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`; // Fixed API key reference
    const response = await axios.get(url);

    if (response.status !== 200) {
        throw new Error(`Google Maps API failed: ${response.status}`);
    }

    const data = response.data;

    if (data.status !== "OK" || !data.results || !data.results.length) {
        throw new Error(`Geocoding error: ${data.status}`);
    }

    console.log(data.results[0].formatted_address);
    return data.results[0].formatted_address;
}

let route = require("./routes");
app.use("/api/admin", route.apiRoutes);
app.use("/api/efacto", require("./routes/efactoRoutes"));
app.listen(config.port, "0.0.0.0");
console.log("Server open at http://localhost:" + config.port);

// setUpCronJobs();

module.exports = listEndpoints(app);
