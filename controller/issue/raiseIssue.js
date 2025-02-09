let issueSchema = require("../../sharedmb/schema/reportIssue");
let orderSchema = require("../../sharedmb/schema/order");
let utility = require("../../sharedmb/utility/utility");

let checkOrder = (req, res, next) => {
    if (req.body.orderId) {
        let condition = {
            _id: req.body.orderId,
        };
        orderSchema.findOne(condition, (err, response) => {
            if (err) {
                return res.status(400).json({
                    error: err,
                    message: "error occurred",
                    success: false,
                    ok: 0,
                });
            } else if (response) {
                next();
            } else {
                return res.status(200).json({
                    message: "order not found",
                    success: false,
                    ok: 1,
                });
            }
        });
    } else {
        next();
    }
};

let raiseIssue = (req, res, next) => {
    let issue = {
        description: req.body.message ? req.body.message : null,
        userId: req.body.userId ? req.body.userId : null,
        issue: req.body.subject ? req.body.subject : null,
        created: new Date().getTime(),
        updated: new Date().getTime(),
        date: new Date(),
        email: req.body.email ? req.body.email : null,
        phoneNo: req.body.phoneNo ? req.body.phoneNo : null,
        type: req.body.subject ? req.body.subject : "other",
        status: "new",
        orderId: req.body.orderId ? req.body.orderId : null,
    };
    issueSchema.create(issue, (err, response) => {
        if (err) {
            return res.status(400).json({
                error: err,
                message: "error occurred",
                success: false,
                ok: 0,
            });
        } else if (response) {
            res.status(201).json({
                message: "issue raised",
                success: true,
                ok: 1,
            });
            req.data = response;
            next();
        } else {
            return res.status(200).json({
                message: "issue creation failed",
                success: false,
                ok: 1,
            });
        }
    });
};

let sendmessageOnMobile = (req, res) => {
    let payload = {
        phoneNo: req.body.phoneNo,
        body: `Hello! Your Support ticket no. ${req.data.id} is registered. Please be patient, we assure resolution in 24 hours.\n\nMorningBag`,
    };
    utility.otpSendWow(payload, (err, smsRes) => {
        if (err) {
            console.log("error occured in send sms.");
        } else {
            console.log("Issue sms send successfully.");
        }
    });
};

module.exports = [checkOrder, raiseIssue, sendmessageOnMobile];
