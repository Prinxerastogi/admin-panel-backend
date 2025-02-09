const HomeScreenCard = require("../../sharedmb/schema/HomeScreenCard");
const crudModel = require("../../sharedmb/models/crud");
const {
    deleteRedisCache,
    deleteHomePageRedisCache,
} = require("../../library/redis");

const updateMongo = async (req, res) => {
    const { _id } = req.body; // Assuming _id is being passed in the request body
    if (!_id) {
        return res.status(400).json({ message: "Missing _id in request body" });
    }

    const body = { $set: { isDeleted: true } };
    crudModel.findByIdAndUpdate(
        _id,
        body,
        { new: true, useFindAndModify: false },
        HomeScreenCard,
        (err, result) => {
            if (err) {
                return res.status(400).json({ message: error.message });
            } else if (!result) {
                return res
                    .status(404)
                    .json({ message: "HomeScreenCard not found" });
            } else {
                deleteHomePageRedisCache();
                return res.json({
                    message: "HomeScreenCard deleted successfully",
                    data: result,
                });
            }
        }
    );
};

module.exports = [updateMongo];
