let crud = require("../../sharedmb/models/crud");
let schema = require("../../sharedmb/schema/referal");

module.exports = [
  (req, res) => {
    crud.updateOne(
      { _id: req.body.referalId },
      {
        $set: req.body,
      },
      {},
      schema,
      (err, updated) => {
        if (err)
          return res.status(400).json({
            success: false,
            message: "error occured in  updated refaral",
            err,
          });
        if (updated.n > 0 && updated.modifiedCount == 1) {
          return res.status(200).json({
            success: true,
            message: "update successfully",
          });
        }
        return res
          .status(201)
          .json({ success: false, message: "already updated" });
      }
    );
  },
];
