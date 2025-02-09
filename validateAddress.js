require("dotenv").config();
const mongoose = require("mongoose");
const config = require("config");
const axios = require("axios");
const stringSimilarity = require("string-similarity");

const GOOGLE_MAPS_API_KEY = "AIzaSyC-smWaXJTSXppHww8X_k5_VYZnWDD6QSs";
const BATCH_SIZE = 10; // Limit the number of users processed in one batch

// Connect to MongoDB
mongoose
    .connect(config.database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
    })
    .then(() => {
        console.log("✅ Connected to MongoDB");
        validateAllUsers();
    })
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const UserModel = mongoose.model(
    "User",
    new mongoose.Schema({
        name: { type: String, lowercase: true },
        phoneNo: Number,
        address: [
            {
                latitude: Number,
                longitude: Number,
                line2: { type: String, lowercase: true },
                status: {
                    type: String,
                    enum: ["correct", "incorrect", "cannotdecide", null],
                    default: null,
                },
            },
        ],
    })
);

// Reverse Geocode (Fetch batch of users)
async function reverseGeocodeBatch(users) {
    try {
        const requests = users.map((user) =>
            axios
                .get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${user.address.latitude},${user.address.longitude}&key=${GOOGLE_MAPS_API_KEY}`
                )
                .then((res) => ({
                    user,
                    geoData:
                        res.data.status === "OK"
                            ? res.data.results[0]?.formatted_address
                            : null,
                }))
                .catch(() => ({ user, geoData: null }))
        );

        return await Promise.allSettled(requests);
    } catch (error) {
        console.error("Reverse Geocoding Error:", error.message);
        return [];
    }
}

// Process users in batches
async function processBatch(skip) {
    const users = await UserModel.aggregate([
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
                phoneNo: "$phoneNo",
                address: "$address",
            },
        },
        { $skip: skip },
        { $limit: BATCH_SIZE },
    ]);

    if (!users.length) return false;

    console.log(`🔍 Processing ${users.length} users...`);

    const results = await reverseGeocodeBatch(users);

    const bulkUpdates = results
        .map(({ value }) => {
            if (!value || !value.geoData) return null;

            const { user, geoData } = value;
            const similarity = stringSimilarity.compareTwoStrings(
                user.address.line2.toLowerCase(),
                geoData.toLowerCase()
            );

            if (similarity > 0.7) {
                console.log(user.address.line2, geoData, similarity);
                return {
                    updateOne: {
                        filter: { _id: user.userId, "address._id": user._id },
                        update: { $set: { "address.$.status": "correct" } },
                    },
                };
            }

            return null; // Skip incorrect matches
        })
        .filter(Boolean); // Remove null values

    if (bulkUpdates.length) {
        console.log(`✅ Updated ${bulkUpdates.length} users.`);
        await UserModel.bulkWrite(bulkUpdates);
    }

    return bulkUpdates.length;
}

// Main function to process all users in batches
async function validateAllUsers() {
    try {
        let skip = 0;
        let hasMore = true;
        let totalUpdated = 0; // Track total updates

        while (hasMore) {
            const updatedCount = await processBatch(skip);
            if (updatedCount === false) break;
            totalUpdated += updatedCount;
            skip += BATCH_SIZE;
        }

        console.log(`🚀 Total users updated: ${totalUpdated}`);
    } catch (err) {
        console.error("❌ Error fetching users:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

// Run

/**
 * Reverse geocode a given latitude and longitude using the Google Maps Geocoding API.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @returns {Promise<Object>} - The first result object from the API response.
 */

/**
 * Extract the sub locality from the Google geocoding result.
 * Looks for address component types that indicate sub locality.
 * @param {Object} geoData - The geocoded result from Google Maps.
 * @returns {string|null} - The sub locality if found, otherwise null.
 */
function getSubLocality(geoData) {
    if (!geoData.address_components) return null;

    // Check for different sublocality levels and neighborhood
    const subLocalityComponent = geoData.address_components.find(
        (component) =>
            component.types.includes("sublocality") ||
            component.types.includes("sublocality_level_1") ||
            component.types.includes("sublocality_level_2") ||
            component.types.includes("neighborhood")
    );

    return subLocalityComponent ? subLocalityComponent.long_name : null;
}

/**
 * Normalize a string by converting it to lowercase and removing non-alphanumeric characters.
 * @param {string} str - The string to normalize.
 * @returns {string} - The normalized string.
 */
function normalizeString(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Checks if the customer-provided sub locality matches the geocoded sub locality using fuzzy matching.
 * @param {Object} addressObj - The address object from the user schema.
 * @param {Object} geoData - The reverse geocode data from Google Maps.
 * @returns {boolean} - True if the similarity exceeds the threshold, false otherwise.
 */
function addressMatches(addressObj, geoData) {
    const customerSubLocality = addressObj.line2.trim();
    const geoSubLocality = getSubLocality(geoData);

    if (!geoSubLocality) {
        console.warn(
            `No sub locality found in geocoded data for address "${addressObj.line1}, ${addressObj.line2}"`
        );
        return false;
    }

    // Use proper normalization for both strings
    const geoFormatted = normalizeString(geoSubLocality);
    const customerFormatted = normalizeString(customerSubLocality);

    const similarity = stringSimilarity.compareTwoStrings(
        customerFormatted,
        geoFormatted
    );
    console.log(
        `Comparing "${customerSubLocality}" with "${geoSubLocality}" (similarity: ${similarity})`
    );

    return similarity > 0.6; // Increased threshold for better accuracy
}

/**
 * Validate all users in batches using a Mongoose cursor.
 */

validateAllUsers();
