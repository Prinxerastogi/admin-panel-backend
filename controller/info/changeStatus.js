let infoPageSchema = require("../../sharedmb/schema/infoPage");

let findInfoPage = (req, res, next) => {
  req.data = {};
  let condition = {
    id: req.params.id,
  };
  infoPageSchema.findOne(condition, (err, response) => {
    if (err) {
      return res.status(400).json({
        message: "error in matching info page",
        success: false,
        error: err,
      });
    } else if (response) {
      req.data.infoPage = response;
      next();
    } else {
      return res
        .status(200)
        .json({ message: "info page not found", success: false });
    }
  });
};

let updateInfoPage = (req, res) => {
  let condition = {
    id: req.params.id,
  };
  let update = {
    isActive: !req.data.infoPage.isActive,
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
        .json({ message: "info page updated", success: true });
    } else {
      return res
        .status(200)
        .json({ message: "info page update failed", success: false });
    }
  });
};

module.exports = [findInfoPage, updateInfoPage];
