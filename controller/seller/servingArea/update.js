let serveAreaSchema = require("../../../sharedmb/schema/servingArea");
let updateServeArea = (req, res) => {
  let condition = {
    "servingAreas._id": req.params.id,
  };

  let data = {
    $set: {
      "servingAreas.$.area": req.body.area,
      "servingAreas.$.areaName": req.body.areaName,
    },
  };

  serveAreaSchema.updateOne(condition, data, (err, updateRes) => {
    if (err) {
      res.status(400).json({ err: true, message: err.message });
    } else if (updateRes.modifiedCount > 0) {
      res.status(200).send({
        success: true,
        message: "serve area updated successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "unable to find serve area",
      });
    }
  });
};

module.exports = [updateServeArea];
