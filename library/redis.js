const Redis = require("redis");

let state = { redisClient: null };
/**
 * Method to connect to the redis-server
 * @param {*} url
 * @returns connection object
 */
const connect = async () => {
    try {
        if (state.redisClient) return state.redisClient;

        const client = Redis.createClient({
            url: process.env.redis_url,
            password: process.env.redis_password,
        });

        console.log(client);
        client.on("error", (err) => console.log("Redis Client Error", err));
        await client.connect();

        state.redisClient = client;

        return client;
    } catch (error) {
        console.error("Error connecting redis", error);
    }
};
/**
 * Method to cache the data in redis
 * @returns db object
 */
exports.cacheToRedis = async (key, value, ext) => {
    try {
        const client = await connect();

        const data = await client.get(key);
        if (data) {
            console.info("already cached", data);
            return true;
        }
        console.info("cached new data");
        return await client.setEx(key, ext, JSON.stringify(value));
    } catch (error) {
        console.error("Error in cacheToRedis function", error);
    }
};

/**
 * Method to get the data from redis
 */
exports.getRedisCache = async (key) => {
    try {
        const client = await connect();

        const data = await client.get(key);
        if (!data) {
            return false;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error("Error in getCacheData", error);
        return false;
    }
};

exports.deleteRedisCache = async (key) => {
    try {
        const client = await connect();

        const result = await client.del(key);
        if (result === 1) {
            console.info("Deleted key:", key);
            return true;
        } else {
            console.info("Key not found:", key);
            return false;
        }
    } catch (error) {
        console.error("Error in deleteRedisCache function", error);
        return false;
    }
};
exports.deleteHomePageRedisCache = async () => {
    try {
        const client = await connect();
        const result = await client.del("HomeScreenCards-android");
        client.del("HomeScreenCards-ios");
        client.del("HomeScreenCards-undefined");
        if (result === 1) {
            console.info(
                "Deleted key: ",
                "HomeScreenCards-android",
                "HomeScreenCards-ios",
                "HomeScreenCards-undefined"
            );
            return true;
        } else {
            console.info(
                "Key not found:",
                "HomeScreenCards-android",
                "HomeScreenCards-ios",
                "HomeScreenCards-undefined"
            );
            return false;
        }
    } catch (error) {
        console.error("Error in deleteRedisCache function", error);
        return false;
    }
};
