let infoPageSchema = require("../../sharedmb/schema/infoPage");

let updateInfoPage = (req, res) => {
  let condition = {
    id: req.params.id,
  };
  let update = {
    isDelete: true,
  };
  infoPageSchema.updateOne(condition, update, (err, response) => {
    if (err) {
      return res.status(400).json({
        message: "error in matching info page",
        success: false,
        error: err,
      });
    } else if (response.modifiedCount > 0) {
      return res
        .status(201)
        .json({ message: "info page deleted", success: true });
    } else {
      return res
        .status(200)
        .json({ message: "info page update failed", success: false });
    }
  });
};

module.exports = [updateInfoPage];
