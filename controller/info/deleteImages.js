let config = require("config");
let validate = require("express-validation");
let validation = require("./validation");
let findRemoveSync = require("find-remove");
let infoPageSchema = require("../../sharedmb/schema/infoPage");

let findProductAndRemoveImageFromDB = (req, res, next) => {
  req.data = {};
  let condition = {
    id: req.params.id,
  };
  let update = {
    $pull: {
      images: {
        $regex: req.body.image,
      },
    },
  };
  infoPageSchema.updateOne(condition, update, (err, response) => {
    if (err) {
      return res.status(400).json({
        error: true,
        message: "error occured in finding infoPage ",
        err,
      });
    } else if (response.modifiedCount > 0) {
      next();
    } else {
      return res
        .status(400)
        .json({ error: true, message: "fail to update images", err });
    }
  });
};

let removeImageFromServer = (req, res) => {
  let folderPath = `${config.upload.infoImagePath}${req.params.id}/`;
  let result = findRemoveSync(folderPath, { prefix: req.body.image });
  if (Object.keys(result).length > 0) {
    return res.status(200).json({ success: true, message: "image deleted" });
  } else {
    return res.status(201).json({ success: true, message: "no image found" });
  }
};

module.exports = [
  validate(validation.removeImage),
  findProductAndRemoveImageFromDB,
  removeImageFromServer,
];
