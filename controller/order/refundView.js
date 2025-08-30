let orderSchema = require("../../sharedmb/schema/order");
let refundSchema = require("../../sharedmb/schema/refund");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
  (req, res, next) => {
    let condition = mongoose.isValidObjectId(req.query.orderId)
      ? [
          {
            $match: {
              _id: new mongoose.Types.ObjectId(req.query.orderId),
            },
          },
        ]
      : [
          {
            $match: {
              id: Number(req.query.orderId),
            },
          },
        ];
    condition.push(
      {
        $unwind: {
          path: "$product",
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $unwind: {
          path: "$products",
        },
      },
      {
        $addFields: {
          "products.quantity": "$product.quantity",
          "products.price": "$product.price",
          "products.sellPrice": "$product.sellPrice",
        },
      },
      {
        $group: {
          _id: "$_id",
          sellerId: {
            $first: "$sellerId",
          },
          userId: {
            $first: "$userId",
          },
          address: {
            $first: "$address",
          },
          id: {
            $first: "$id",
          },
          deliveryDate: {
            $first: "$deliveryDate",
          },
          date: {
            $first: "$date",
          },
          promocode: {
            $first: "$promocode",
          },
          couponDiscount: {
            $first: "$couponDiscount",
          },
          totalSaving: {
            $first: "$totalSaving",
          },
          offerId: {
            $first: "$offerId",
          },
          amount: {
            $first: "$amount",
          },
          products: {
            $push: "$products",
          },
          status: {
            $first: "$status",
          },
          paymentSource: {
            $first: "$paymentSource",
          },
          smallCartFee: {
            $first: "$smallCartFee",
          },
          grossProfit: {
            $first: "$grossProfit",
          },
          customerMessage: {
            $first: "$customerMessage",
          },
          deliveryCharge: {
            $first: "$deliveryCharge",
          },
          isDeliveryCharge: {
            $first: "$isDeliveryCharge",
          },
          otp: {
            $first: "$otp",
          },
          deliveryTime: {
            $first: "$deliveryTime",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: {
          path: "$seller",
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offerId",
          foreignField: "_id",
          as: "offer",
        },
      },
      {
        $unwind: {
          path: "$offer",
          includeArrayIndex: "index",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    crud.aggregation(condition, orderSchema, (err, orders) => {
      if (err)
        return res
          .status(400)
          .json({ message: "error occured in orderlist", err });
      else if (orders && orders.length > 0) {
        req.data = orders[0];
        return next();
      }
      return res
        .status(201)
        .json({ success: false, message: "order list  not found" });
    });
  },
  async (req, res) => {
    const refunds = await refundSchema.find({
      orderId: req.data._id,
      status: "success",
    });
    if (refunds) {
      req.data.order = {
        ...req.data.order,
        product: req.data.product.map((item) => {
          // Check if this product exists in any of the refunds
          const isRefunded = refunds.some((refund) =>
            refund.products.some(
              (refundProduct) =>
                refundProduct.id &&
                refundProduct.id.toString() === item.id.toString()
            )
          );
          return {
            ...item,
            isRefunded,
          };
        }),
      };
    }
    return res.status(200).json({
      success: true,
      message: "list found",
      order: req.data,
    });
  },
];
