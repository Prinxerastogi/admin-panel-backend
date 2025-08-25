let voucherCodeschema = require("../../sharedmb/schema/vouchercode"),
  cashRequestSchema = require("../../sharedmb/schema/cashRequest"),
  crud = require("../../sharedmb/models/crud"),
  utility = require("../../sharedmb/utility/utility"),
  mongoose = require("mongoose"),
  config = require("config");

let findCashRequest = (req, res, next) => {
  req.data = {};
  let condition = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.body._id),
        status: "new",
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
  ];
  crud.aggregation(condition, cashRequestSchema, (err, request) => {
    if (err)
      return res.status(400).json({
        success: false,
        message: "error occured in findCashRequest",
        err,
      });
    if (!request || request == null) {
      return res
        .status(201)
        .json({ success: false, message: "request not found" });
    }
    req.data.request = request[0];
    if (request) generateVoucherCode(req, res);
  });
};

let generateVoucherCode = (req, res) => {
  if (req.data.request.amount == undefined || req.data.request.amount == null) {
    return res
      .status(200)
      .json({ success: false, message: "amount validation error" });
  }
  let code = utility.vouchercode();
  req.data.code = code;
  let plastfourdigits = code.slice(-4);
  req.data.plastfourdigits = plastfourdigits;
  let pcode = code.slice(0, -4);
  req.data.pcode = pcode;
  hash(req, res);
  // next()
};

let hash = (req, res) => {
  utility.hash(req.data.plastfourdigits, (err, hash) => {
    if (err)
      return res.status(400).json({
        success: false,
        message: "error occured in hash generateVouchercode",
        err,
      });
    else {
      req.data.sCode = hash;
      //next();
      create(req, res);
    }
  });
};

let create = (req, res) => {
  let date = new Date();
  var twoDaysAfter = date.getDate() + 2;
  var curr_month = date.getMonth();
  var curr_year = date.getFullYear();
  let expiredate = date.setDate(date.getDate() + 2);

  let data = {
    pCode: req.data.pcode,
    sCode: req.data.sCode,
    amount: req.data.request.amount, // if is percent, then number must be ≤ 100, else it’s amount of discount
    expireDate: new Date(expiredate),
    isActive: true,
    created: new Date().getTime(),
    updated: new Date().getTime(),
    createdBy: req.decoded.id,
    date: new Date(),
  };
  crud.create(data, voucherCodeschema, (err, created) => {
    if (err) {
      findCashRequest(req, res);
    }
    //return res.status(400).json({ success: false, message: 'error occured in create', err });
    else if (created) {
      updatevoucherCodeCashRequest(req, res);
      //return res.status(200).json({ success: true, message: 'create successfully', data: created, code: req.data.code });
    } else {
      return res.status(201).json({
        success: false,
        message: "something went wrong in voucher code",
      });
    }
  });
};

let updatevoucherCodeCashRequest = (req, res) => {
  crud.updateOne(
    { _id: req.body._id },
    {
      $set: {
        voucherCode: req.data.code,
        status: "accepted",
      },
    },
    {},
    cashRequestSchema,
    (err, updated) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "error occured in updatevoucherCodeCashRequest",
          err,
        });
      }
      if (updated.n > 0 && updated.modifiedCount > 0) {
        if (utility.isEmail(req.data.request.user.email)) {
          sendEmail(req, res);
        } else {
          sendmessageOnMobile(req, res);
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "something went wrong in updatevoucherCodeCashRequest",
          err,
        });
      }
    }
  );
};

let sendEmail = (req, res) => {
  let payload = {
    email: req.data.request.user.email,
    subject: "Voucher Code",
    template_id: config.sendgrid.voucherCodeTemplateId,
    from: {
      fromEmail: config.cron.email.fromEmail,
      fromName: config.cron.email.fromName,
    },
    substitutions: {
      "{{voucherCode}}": req.data.code,
      "{{name}}": req.data.request.user.name
        ? req.data.request.user.name
        : req.data.request.address.name,
    },
  };
  utility.sendEmail(payload, (err, status) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "error occured in send email",
      });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "create successfully" });
    }
  });
};

let sendmessageOnMobile = (req, res) => {
  let payload = {
    phoneNo: req.data.request.user.phoneNo,
    body: `Your cash request has been approved. Kindly feel free to redeem this voucher code ${req.data.code} into your MorningBag wallet.`,
  };
  utility.otpSendWow(payload, (err, otpsend) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "error occured in send mesage on phone",
      });
    } else {
      return res
        .status(200)
        .json({ success: true, message: "create successfully" });
    }
  });
};

module.exports = [
  findCashRequest,
  // generateVoucherCode,
  // hash,
  // create
];
