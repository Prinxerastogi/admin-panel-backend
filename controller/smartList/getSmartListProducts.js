"use strict";
let mongoose = require("mongoose");
let productSchema = require("../../sharedmb/schema/product");
let smartListSchema = require("../../sharedmb/schema/smartList");
let categorySchema = require("../../sharedmb/schema/category");
let sellerSchema = require("../../sharedmb/schema/seller");

// let findSellerCatIds = (req, res, next) => {
//     console.log(req.query);
//     let condition = [
//         {
//             $match: {
//                 cities: new mongoose.Types.ObjectId(req.query.cityId),
//             },
//         },
//     ];
//     req.sellerCatIds = [];
//     sellerSchema.aggregate(condition, (err, seller) => {
//         if (err) {
//             res.status(400).json({ err: true, message: err.message });
//         } else if (seller.length > 0) {
//             req.sellerCatIds = seller[0].categoryIds;
//             next();
//         } else {
//             res.status(200).json({
//                 success: false,
//                 message: "seller category not found",
//             });
//         }
//     });
// };

const getSmartListProducts = async (req, res) => {
  try {
    let conditions = {
      _name: req.params.smartlist_name,
    };

    console.log(conditions);

    let smartList = null;

    smartList = await smartListSchema.findOne(conditions);

    if (!smartList) {
      return res
        .status(404)
        .json({ success: false, message: "SmartList not found" });
    }

    const filter = {};
    if (smartList.config.brand) {
      filter["brand.id"] = new mongoose.Types.ObjectId(smartList.config.brand);
    }

    if (smartList.config.subBrand) {
      filter["subBrand.id"] = new mongoose.Types.ObjectId(
        smartList.config.subBrand
      );
    }

    if (smartList.config.leafCategory) {
      filter["categoryId"] = new mongoose.Types.ObjectId(
        smartList.config.leafCategory
      );
    } else if (smartList.config.subCategory) {
      const category = await categorySchema.findById(
        new mongoose.Types.ObjectId(smartList.config.subCategory)
      );

      if (category && category.childIds && category.childIds.length > 0) {
        filter["categoryId"] = {
          $in: category.childIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    } else if (smartList.config.category) {
      const Categories = await categorySchema.find({
        parentId: new mongoose.Types.ObjectId(smartList.config.category),
      });

      if (Categories && Categories.length > 0) {
        const categoryIds = [];

        Categories.forEach((childCat) => {
          if (childCat.childIds && childCat.childIds.length > 0) {
            categoryIds.push(
              ...childCat.childIds.map((id) => new mongoose.Types.ObjectId(id))
            );
          }

          categoryIds.push(new mongoose.Types.ObjectId(childCat._id));
        });

        filter["categoryId"] = { $in: categoryIds };
      }
    }

    filter["isActive"] = true;
    filter["verification.isApproved"] = true;

    console.log(filter);

    const products = await productSchema.aggregate([
      { $match: filter },

      {
        $lookup: {
          from: "sellerproducts",
          localField: "_id",
          foreignField: "productId",
          as: "sellerProducts",
        },
      },

      {
        $unwind: { path: "$sellerProducts", preserveNullAndEmptyArrays: false },
      },

      {
        $match: {
          $expr: {
            $eq: ["$_id", "$sellerProducts.productId"],
          },
        },
      },

      {
        $addFields: {
          "sellerProducts.discountPercentage": {
            $cond: {
              if: { $eq: ["$sellerProducts.minSellPrice", 0] },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          "$sellerProducts.minSellPrice",
                          "$sellerProducts.sellPrice",
                        ],
                      },
                      "$sellerProducts.minSellPrice",
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      },

      {
        $match: {
          ...(smartList.config.minPrice ||
          smartList.config.maxPrice ||
          smartList.config.minDiscount ||
          smartList.config.maxDiscount
            ? {
                $and: [
                  ...(smartList.config.minPrice
                    ? [
                        {
                          "sellerProducts.sellPrice": {
                            $gte: smartList.config.minPrice,
                          },
                        },
                      ]
                    : []),
                  ...(smartList.config.maxPrice
                    ? [
                        {
                          "sellerProducts.sellPrice": {
                            $lte: smartList.config.maxPrice,
                          },
                        },
                      ]
                    : []),
                  ...(smartList.config.minDiscount
                    ? [
                        {
                          "sellerProducts.discountPercentage": {
                            $gte: smartList.config.minDiscount,
                          },
                        },
                      ]
                    : []),
                  ...(smartList.config.maxDiscount
                    ? [
                        {
                          "sellerProducts.discountPercentage": {
                            $lte: smartList.config.maxDiscount,
                          },
                        },
                      ]
                    : []),
                ],
              }
            : {}),
        },
      },

      {
        $addFields: {
          quantity: "$sellerProducts.quantity",
          perUserOrderQuantity: "$sellerProducts.perUserOrderQuantity",
          price: "$sellerProducts.price",
          sellPrice: "$sellerProducts.sellPrice",
          minSellPrice: "$sellerProducts.minSellPrice",
          storeMinQuantity: "$sellerProducts.storeMinQuantity",
          isOrder: "$sellerProducts.isOrder",
          isLastBuy: "$sellerProducts.isLastBuy",
          isSubscription: "$sellerProducts.isSubscription",
          isMorningBuy: "$sellerProducts.isMorningBuy",
          outofStock: {
            $cond: {
              if: { $lte: ["$sellerProducts.quantity", 0] },
              then: 1,
              else: 0,
            },
          },
        },
      },

      { $unset: "brand" },
    ]);
    if (!products.length) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    console.log("Product length:", products.length);

    return res.status(200).json({ success: true, products, smartList });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = [
  // findSellerCatIds,
  getSmartListProducts,
];
