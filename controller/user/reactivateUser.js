let userSchema = require("../../sharedmb/schema/user");
const message = require("../tags/message");

const reactivateUser = async (req, res, next) => {
    try {
        const phoneNo = req.body.phoneNo;

        const result = await userSchema.findOneAndUpdate(
            { phoneNo: phoneNo },
            { $set: { isSoftDelete: false } },
            {}
        );
        console.log(result);
        if (result) {
            res.json({ message: "Account activated", success: true });
        } else {
            res.json({ message: "Phone No not found", success: false });
        }
    } catch (err) {
        console.log("Error in activating user :", err);
        res.json({ message: "Error in activating user", success: false, err });
    }
};

module.exports = [reactivateUser];
