let twilio = require("twilio");
let config = require("config");
let bcrypt = require("bcrypt");
let saltRounds = 10;
let jwt = require("jsonwebtoken");
var async = require("async");
var needle = require("needle");
let phoneNoRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let randomize = require("randomatic");
let MailChecker = require("mailchecker");
let AWS = require("aws-sdk");
const admin = require("firebase-admin");
// Your Firebase service account key

// Initialize FCM if not already
if (!admin.apps.length) {
    try {
        const serviceAccount = require("../../aapkabazar-app-firebase-adminsdk-4xnqb-770a960037.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (err) {
        console.warn(
            "Firebase credentials not loaded. Running without Firebase."
        );
    }
}

module.exports.isEmail = (userId) => {
    return emailRegex.test(userId);
};

module.exports.isPhoneNo = (userId) => {
    return phoneNoRegex.test(userId);
};

module.exports.sendEmail = (payload, callback) => {
    var sg = require("sendgrid")(config.sendgrid.key);
    var request = sg.emptyRequest();
    request.body = {
        from: {
            email: payload.from.fromEmail, //"no-reply@morningbag.com",
            name: payload.from.fromName, //"MorningBag"
        },
        personalizations: [
            {
                to: [
                    {
                        email: payload.email,
                    },
                ],
                subject: payload.subject,
                substitutions: payload.substitutions,
            },
        ],
        subject: payload.subject,
        template_id: payload.template_id,
    };
    request.method = "POST";
    request.path = "/v3/mail/send";

    sg.API(request, function (error, response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        if (error) callback(error, null);
        else callback(null, response);
    });
};

module.exports.otpSend = (payload) => {
    let accountSid = config.twilio.accountSid; // Your Account SID from www.twilio.com/console
    let authToken = config.twilio.authToken; // Your Auth Token from www.twilio.com/console
    let client = new twilio(accountSid, authToken);
    client.messages
        .create({
            body: payload.body,
            to: config.twilio.countryCodeTo + payload.phoneNo, // Text this number
            from: config.twilio.fromNo, // From a valid Twilio number
        })
        .then((message) => console.log(message));
};

module.exports.hash = (password, callback) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            callback(err, hash);
        });
    });
};

module.exports.checkHashPassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, function (err, res) {
        callback(err, res);
    });
};

module.exports.jwtToken = (payload, userType) => {
    let secret = userType == "user" ? config.userSecret : config.vendorSecret;
    let token = jwt.sign(payload, secret, {
        expiresIn: "1 days", // expires in 24 hours
    });
    return token;
};

module.exports.sendEmailAndFile = (payload, callback) => {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(config.sendgrid.key);
    sgMail.send(payload.msg, function (error, response) {
        if (error) callback(error, null);
        else callback(null, response);
    });
};

module.exports.otpSendWowOld = (payload, callback) => {
    let authkey = config.msgWow.authKey;
    let link = `${config.msgWow.urllink}=${authkey}&mobiles=${payload.phoneNo}&message=${payload.body}&sender=${config.msgWow.senderId}&route=${config.msgWow.route}&country=${config.msgWow.country}`;
    needle.get(link, function (err, response) {
        console.log(err);
        if (err) callback(err, null);
        else callback(null, response);
    });
};

module.exports.removeSpecialCharAndDash = (name) => {
    if (name && typeof name === "string") {
        return name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .replace(/ /g, "-");
    }
    return name;
};

module.exports.removeSpecialChar = (name) => {
    if (name && typeof name === "string") {
        return name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "");
    }
    return name;
};

module.exports.otpGenerate = () => {
    let otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
};

module.exports.referalcode = () => {
    let code = randomize("?", 6, { chars: "MB" });
    return code;
};

module.exports.rfcode = () => {
    var chars =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        result = "";
    for (var i = 6; i > 0; --i)
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
};

module.exports.vouchercode = () => {
    var text = "";
    var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports.otpSendWow = (payload, callback) => {
    let link = `api.textlocal.in/send?username=${config.textLocal.username}&hash=${config.textLocal.hash}&sender=${config.textLocal.sender}&numbers=${payload.phoneNo}&message=
    ${payload.body}`;
    // let link = `http://sms.morningbag.com/sendSMS?username=${config.bulkMSG.username}&message=${payload.body}&sendername=${config.bulkMSG.sendername}&smstype=${config.bulkMSG.smstype}&numbers=${payload.phoneNo}&apikey=${config.bulkMSG.apiKey}`
    // let link = `http://new.smsturtle.com/app/smsapi/index.php?key=${config.smsTurtle.apiKey}&campaign=0&routeid=9&type=${config.smsTurtle.smstype}&contacts=${payload.phoneNo}&senderid=${config.smsTurtle.sendername}&msg=${payload.body}&template_id=${config.smsTurtle.templateId}`
    needle.get(link, function (err, response) {
        console.log(err);
        if (err) callback(err, null);
        else callback(null, response);
    });
};

module.exports.otpResendWow = (payload, callback) => {
    let link = `api.textlocal.in/send?username=${config.textLocal.username}&hash=${config.textLocal.hash}&sender=${config.textLocal.sender}&numbers=${payload.phoneNo}&message=
    ${payload.body}`;
    // let link = `http://sms.morningbag.com/sendSMS?username=${config.bulkMSG.username}&message=${payload.body}&sendername=${config.bulkMSG.sendername}&smstype=${config.bulkMSG.smstype}&numbers=${payload.phoneNo}&apikey=${config.bulkMSG.apiKey}`
    // let link = `http://new.smsturtle.com/app/smsapi/index.php?key=${config.smsTurtle.apiKey}&campaign=0&routeid=9&type=${config.smsTurtle.smstype}&contacts=${payload.phoneNo}&senderid=${config.smsTurtle.sendername}&msg=${payload.body}&template_id=${config.smsTurtle.templateId}`
    needle.get(link, function (err, response) {
        console.log(err);
        if (err) callback(err, null);
        else callback(null, response);
    });
};

module.exports.otpSendWowAll = (payload, callback) => {
    let link = `https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx?APIKEY=${process.env.smsapiKey}&MobileNo=${payload.phoneNo}&SenderID=AKBAZA&Message=${payload.body}&ServiceName=TEMPLATE_BASED`;
    needle.get(link, function (err, response) {
        console.log(err);
        if (err) callback(err, null);
        else callback(null, response);
    });
};

module.exports.cronJobs = {
    everySecond: "* * * * * *",
    every5Seconds: "*/5 * * * * *",
    every10Seconds: "*/10 * * * * *",
    every30Seconds: "*/30 * * * * *",
    everyMinute: "0 * * * * *",
    every5Minutes: "0 */5 * * * *",
    every10Minutes: "0 */10 * * * *",
    every30Minutes: "0 */30 * * * *",
    everyHour: "0 0 * * * *",
    at12pmEveryDay: "0 0 12 * * *",
    at02pmEveryDay: "0 0 14 * * *",
    at04pmEveryDay: "0 0 16 * * *",
    at08pmEveryDay: "0 0 20 * * *",
    at12amEveryDay: "0 0 0 * * *",
};

module.exports.checkValidEmail = (res, email) => {
    if (MailChecker.isValid(email)) {
        return email;
    } else {
        return res
            .status(400)
            .json({ success: false, message: "please provide valid email" });
    }
};

module.exports.sendAWSSESEmail = (payload, callback) => {
    AWS.config = config.awsConfig;
    let params = {
        Destination: payload.sentTo,
        Message: payload.message,
        Source: payload.emailSource,
    };

    // Create the promise and SES service object
    new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(
        params,
        (err, response) => {
            if (err) callback(err, null);
            else callback(null, response);
        }
    );
};

module.exports.sendNotification = (payload) => {
    return admin.messaging().send(payload);
};
