// let crudModel = require('../../sharedmb/models/crud')

module.exports = [
    //pagination
    (req, res) => {
        let list = [
            // {
            //     type:"Confirm",
            //     message:"Hello! Your Support ticket no. {{issueId}} is registered. Please be patient, we assure resolution by {{estimatedDate}}"
            // },
            {
                type: "Resolved & Refund",
                message:
                    "Hello! We are happy to share that we have resolved your ticket no. {{issueId}}. Rs. {{refundAmount}} refunded to your wallet balance. However, if you are dissatisfied with the resolution provided, please rewrite to us. We are here to help you! \n\nMorningBag",
            },
            {
                type: "Not Reachable",
                message:
                    "Hello! One of our executive tried to call you to resolve ticket no. {{issueId}} but failed, please call back +91 9654633300 immediately so that we could resolve your ticket on priority.\n\nMorningBag",
            },
            {
                type: "Thanks",
                message:
                    "Hello! Thanks for your valuable suggestion for our campaign You name it! we have it, now we are happy to share that we have added your featured products.\n\nMorningBag",
            },
            {
                type: "Resovled Thanks",
                message:
                    "Hello! We are happy to share that we have resolved your ticket no. {{issueId}}. We escalated your query to our concern department you will hear from them as early as possible. However, if you are dissatisfied with the resolution provided, please rewrite to us. We are here to help you!\n\nMorningBag",
            },
        ];

        return res
            .status(200)
            .json({ success: true, message: `message type list`, list });
    },
];
