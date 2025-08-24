"use strict";
let crudModel = require("../../sharedmb/models/crud"),
  productSchema = require("../../sharedmb/schema/product"),
  categorySchema = require("../../sharedmb/schema/category"),
  validate = require("express-validation"),
  validation = require("./validation"),
  mongoose = require("mongoose"),
  MESSAGE = require("./message");

let findCategoryFilter = (req, res, next) => {
  req.data = {};
  let filter = JSON.parse(req.query.filter);
  req.data.filter = filter;
  if (filter.leafCatId) {
    next();
  } else if (filter.subCatId || filter.rootCatId) {
    let condition = [
      {
        $match: {
          _id: filter.subCatId
            ? new mongoose.Types.ObjectId(filter.subCatId)
            : new mongoose.Types.ObjectId(filter.rootCatId),
          isActive: true,
        },
      },
      //  {
      //     project: {
      //         childIds: 1
      //     }
      // }
    ];
    crudModel.aggregation(condition, categorySchema, (err, category) => {
      if (err) {
        return res.status(400).json({
          error: true,
          message: MESSAGE.productlistBystatus.error,
          error: err,
          success: false,
        });
      } else if (category && category.length > 0) {
        req.data.subcategory = category[0].childIds;
        next();
      } else {
        next();
      }
    });
  } else {
    next();
  }
};

let findProductByStatus = (req, res) => {
  let condition = [];
  let pagination = {
    page: Number(req.query.start),
    limit: Number(req.query.end),
  };

  let filter = req.data.filter;

  if (filter.leafCatId) {
    condition.push({
      $match: {
        categories: new mongoose.Types.ObjectId(filter.leafCatId),
        //{
        //     $in: req.data.subcategory

        //     // [new mongoose.Types.ObjectId(filter.subCat) ? new mongoose.Types.ObjectId(filter.subCat) : null
        //     //     , new mongoose.Types.ObjectId(filter.rootCatId) ? new mongoose.Types.ObjectId(filter.rootCatId) : null,
        //     // new mongoose.Types.ObjectId(filter.leafCatId)]
        // }
      },
    });
  } else if (filter.subCatId || filter.rootCatId) {
    condition.push({
      $match: {
        categories: {
          $in: req.data.subcategory,

          // [new mongoose.Types.ObjectId(filter.subCat) ? new mongoose.Types.ObjectId(filter.subCat) : null
          //     , new mongoose.Types.ObjectId(filter.rootCatId) ? new mongoose.Types.ObjectId(filter.rootCatId) : null,
          // new mongoose.Types.ObjectId(filter.leafCatId)]
        },
      },
    });
  } else if (filter.brandId) {
    condition.push({
      $match: {
        "brand.id": new mongoose.Types.ObjectId(filter.brandId),

        // [new mongoose.Types.ObjectId(filter.subCat) ? new mongoose.Types.ObjectId(filter.subCat) : null
        //     , new mongoose.Types.ObjectId(filter.rootCatId) ? new mongoose.Types.ObjectId(filter.rootCatId) : null,
        // new mongoose.Types.ObjectId(filter.leafCatId)]
      },
    });
  }

  // if (!filter.rootCatId && filter.subCat) {
  //     condition.push({
  //         $match: {
  //             categories: {
  //                 $in:

  //                     [new mongoose.Types.ObjectId(filter.subCat) ? new mongoose.Types.ObjectId(filter.subCat) : null
  //                         , new mongoose.Types.ObjectId(filter.leafCatId) ? new mongoose.Types.ObjectId(filter.leafCatId) : null]
  //             }
  //         }
  //     })
  // }
  else if (filter.isNew && !filter.isActive && !filter.isHold) {
    condition.push({
      $match: {
        status: "new",
        isActive: false,
        isDeleted: false,
      },
    });
  } else if (!filter.isNew && filter.isActive && !filter.isHold) {
    condition.push({
      $match: {
        isActive: true,
        status: "approved",
      },
    });
  } else if (!filter.isNew && !filter.isActive && filter.isHold) {
    condition.push({
      $match: {
        isHold: true,
      },
    });
  }

  if (req.query.start != null && req.query.end != null) {
    let sort = {};
    if (filter.sort && filter.order) {
      sort[filter.sort] = Number(filter.order);
    } else {
      sort["updated"] = -1;
    }
    console.log(sort);
    condition.push(
      {
        $group: {
          _id: null,
          total: {
            $sum: 1,
          },
          products: {
            $push: "$$ROOT",
          },
        },
      },

      {
        $unwind: {
          path: "$products",
        },
      },
      {
        $addFields: {
          "products.total": "$total",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$products",
        },
      },
      {
        $sort: sort,
      },

      {
        $skip: pagination.page * pagination.limit,
      },
      {
        $limit: pagination.limit,
      }
    );
  }

  crudModel.aggregation(condition, productSchema, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: true,
        message: MESSAGE.productlistBystatus.error,
        error: err,
        success: false,
      });
    } else if (products && products.length > 0) {
      return res.status(200).json({
        success: true,
        message: `${products.length} product found`,
        products: products,
      });
    } else {
      return res.status(201).json({
        success: false,
        message: MESSAGE.productlistBystatus.noProductFound,
      });
    }
  });
};

module.exports = [findCategoryFilter, findProductByStatus];
