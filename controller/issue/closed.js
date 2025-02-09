let issueSchema = require("../../sharedmb/schema/reportIssue");
let utility = require("../../sharedmb/utility/utility");
let config = require("config");
let mustache = require("mustache");
let mongoose = require("mongoose");
let moment = require("moment");
moment.tz.setDefault("Asia/Kolkata");

let updateIssue = (req, res, next) => {
    let condition = { _id: req.body.issueId },
        update = {
            $set: {
                status: req.body.status,
                resolutionType: req.body.type ? req.body.type : "",
                resolutionMessage: req.body.message ? req.body.message : "",
                updated: new Date().getTime(),
            },
        };
    issueSchema.updateOne(condition, update, {}, (err, updated) => {
        if (err) {
            return res.status(400).json({
                error: true,
                message: "error occured in isseus list",
                err,
            });
        } else if (updated.nModified > 0 && updated.n > 0) {
            // if (req.data.issue.email) {
            //     sendEmail(req.data.issue, req.body.message);
            // }
            // if (req.data.issue.phoneNo) {
            //     sendmessageOnMobile(req.data.issue, req.body.message);
            // }
            return res.status(200).json({
                success: true,
                message: `issue updated  successfully`,
            });
        } else {
            return res.status(201).json({
                success: false,
                message: `something went wrong in issue updated`,
            });
        }
    });
};

let sendEmail = (issue, message) => {
    let payload = {
        sentTo: { ToAddresses: [issue.email] },
        message: {
            Body: {
                Html: {
                    Data: message /* required */,
                    // Charset: 'STRING_VALUE'
                },
                // Text: {
                //     Data: 'STRING_VALUE', /* required */
                //     Charset: 'STRING_VALUE'
                // }
            },
            Subject: {
                /* required */
                Data: "MorningBag : Complaint revert." /* required */,
                // Charset: 'STRING_VALUE'
            },
        },
        subject: "MorningBag : Complaint response.",
        // template_id: config.sendgrid.voucherCodeTemplateId,
        // from: {
        emailSource: config.cron.email.fromEmail,
    };
    utility.sendAWSSESEmail(payload, (err, emailStatus) => {
        if (err) {
            console.log("error occured in send email.", err);
        } else {
            console.log("Issue email send successfully.", emailStatus);
        }
    });
};

let sendmessageOnMobile = (issue, message) => {
    let payload = {
        phoneNo: issue.phoneNo,
        body: message,
    };
    utility.otpSendWow(payload, (err, smsRes) => {
        if (err) {
            console.log("error occured in send sms.", err);
        } else {
            console.log("Issue sms send successfully.", smsRes);
        }
    });
};

module.exports = [updateIssue];
