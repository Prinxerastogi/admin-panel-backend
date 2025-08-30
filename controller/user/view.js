let schema = require("../../sharedmb/schema/user");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
  (req, res) => {
    crud.aggregation(
      [
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.query.userId),
          },
        },
        {
          $unwind: {
            path: "$cart",
            includeArrayIndex: "index",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "cart.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $addFields: {
            "product.quantity": "$cart.quantity",
          },
        },
        {
          $unwind: {
            path: "$product",
            includeArrayIndex: "index",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: "$_id",
            address: {
              $first: "$address",
            },
            id: {
              $first: "$id",
            },
            date: {
              $first: "$date",
            },
            name: {
              $first: "$name",
            },
            phoneNo: {
              $first: "$phoneNo",
            },
            email: {
              $first: "$email",
            },
            isEmailVerify: {
              $first: "$isEmailVerify",
            },
            isPhoneVerify: {
              $first: "$isPhoneVerify",
            },
            balance: {
              $first: "$balance",
            },
            DOB: {
              $first: "$DOB",
            },
            title: {
              $first: "$title",
            },
            referal: {
              $first: "$referal",
            },
            cart: {
              $push: "$product",
            },
          },
        },
      ],

      schema,
      (err, user) => {
        if (err)
          return res
            .status(400)
            .json({ message: "error occured in userlist", err });
        else if (user)
          return res.status(200).json({
            success: true,
            message: "user found",
            user: user[0],
          });
        return res
          .status(201)
          .json({ success: false, message: "user   not found" });
      }
    );
  },
];
