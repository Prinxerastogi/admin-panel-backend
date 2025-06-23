let schema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
let mongoose = require("mongoose");

module.exports = [
    (req, res) => {
        let condition = mongoose.isValidObjectId(req.query.orderId)
            ? [
                  {
                      $match: {
                          _id: mongoose.Types.ObjectId(req.query.orderId),
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
                    "products.refundedQuantity": "$product.refundedQuantity",
                    "products.id": "$product.id",
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
                    paymentMethod: {
                        $first: "$easeBuzzResponse.mode",
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
            },
            {
                $lookup: {
                    from: "refunds",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "refunds",
                },
            },
            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$products",
                            as: "product",
                            in: {
                                $mergeObjects: [
                                    "$$product",
                                    {
                                        refundedQuantity:
                                            "$$product.refundedQuantity",
                                        remainingQuantity: {
                                            $subtract: [
                                                "$$product.quantity",
                                                "$$product.refundedQuantity",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            }
        ),
            crud.aggregation(condition, schema, (err, orders) => {
                if (err)
                    return res
                        .status(400)
                        .json({ message: "error occured in orderlist", err });
                else if (orders && orders.length > 0)
                    return res.status(200).json({
                        success: true,
                        message: "list found",
                        order: orders[0],
                    });
                return res
                    .status(201)
                    .json({ success: false, message: "order list  not found" });
            });
    },
];
