let express = require("express");
const requireDirectory = require("require-directory");
const currFolder = requireDirectory(module, "./");
let apiRoutes = express.Router();
apiRoutes.get("/user/:userId", currFolder.getByUser);
apiRoutes.post("/add-users/:offerId", currFolder.addUsersToOffer);
apiRoutes.post("/redeem/:userId/:offerId/:mode", currFolder.redeemCoupon);
apiRoutes.delete("/remove/:userId/:offerId", currFolder.removeUserFromOffer);
module.exports = apiRoutes;
