let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/banner");

let deleteBanenr = (req, res) => {
  let conditions = {
    _id: req.query.bannerId,
  };
  let update = {
    $set: {
      isDeleted: true,
      updated: new Date().getTime(),
    },
  };
  let options = {};
  crud.updateOne(conditions, update, options, schema, (error, response) => {
    if (error)
      return res
        .status(400)
        .json({ success: false, message: "error ", error: error });
    else if (response.modifiedCount == 1)
      return res.status(200).json({
        success: true,
        message: "deleted successfully",
        response,
      });
    else
      return res
        .status(201)
        .json({ success: false, message: "something went wrong" });
  });
};

module.exports = [deleteBanenr];
