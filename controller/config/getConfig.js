const configSchema = require("../../sharedmb/schema/config");

module.exports = async (req, res) => {
    try {
        const config = await configSchema.findOne({});
        if (config) {
            return res.json({
                message: "Config updated successfully",
                success: true,
                config,
            });
        } else {
            return res.json({
                message: "Config update failed",
                success: false,
            });
        }
    } catch (error) {
        console.log("Error in getConfig", error);
        return res.json({ message: "Internal server error", success: false });
    }
};
