let userSchema = require("../../sharedmb/schema/user");
let orderSchema = require("../../sharedmb/schema/order");
let crud = require("../../sharedmb/models/crud");
const mongoose = require("mongoose");

module.exports = [
    async (req, res) => {
        let { _id, phoneNo, page = 1 } = req.query; 
        
         // **Match Condition for Searching by _id or phoneNo**
         let matchCondition = {};
         if (_id) {
             matchCondition._id = mongoose.Types.ObjectId(_id);
         } else if (phoneNo) {
             matchCondition.phoneNo = phoneNo; // Match by phone number
         } else {
             return res.status(400).json({
                 success: false,
                 message: "Provide either _id or phoneNo to fetch user details",
             });
         }

        let conditions = [
            // Match user by _id
            {
                $match: matchCondition,
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "userId",
                    as: "orders",
                },
            },
            {
                $unwind: { path: "$orders", preserveNullAndEmptyArrays: true }, // Deconstruct the orders array
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phoneNo: 1,
                    date: 1,
                    referredBy: 1,
                    referralBonusGiven: 1,
                    referralCode: 1,
                    otp: 1,
                    isSoftDelete: 1,
                    isDisabled: 1,
                    address: 1,
                    walletBalance: 1,
                    // Project specific fields from orders
                    "orders.date": 1,
                    "orders.created": 1,
                    "orders._id": 1,
                    "orders.deliveryTime": 1,
                    "orders.deliveryDate": 1,
                    "orders.paymentMode": 1,
                    "orders.amount": 1,
                    "orders.isOrderAssigned": 1,
                    "orders.otp": 1,
                    "orders.id": 1,
                    "orders.total": 1,
                    "orders.address": 1,
                    "orders.route": 1,
                    "orders.customerMessage": 1,
                    "orders.status": 1,
                    "orders.userCancelStatus": 1,
                },
            },
            {
                $sort: { "orders.date": -1 }, // Sort the documents by the date field within orders array
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    address: { $first: "$address" },
                    phoneNo: { $first: "$phoneNo" },
                    date: { $first: "$date" },
                    referredBy: { $first: "$referredBy" },
                    referralBonusGiven: { $first: "$referralBonusGiven" },
                    referralCode: { $first: "$referralCode" },
                    isDisabled: { $first: "$isDisabled" },
                    isSoftDelete: { $first: "$isSoftDelete" },
                    otp: { $first: "$otp" },
                    orders: { $push: "$orders" },
                    walletBalance: { $first: "$walletBalance" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "referredBy",
                    as: "referredPeople",
                },
            },
            {
                $unwind: {
                    path: "$referredPeople",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phoneNo: 1,
                    date: 1,
                    referredBy: 1,
                    referralBonusGiven: 1,
                    referralCode: 1,
                    isDisabled: 1,
                    isSoftDelete: 1,
                    otp: 1,
                    orders: 1,
                    address: 1,
                    walletBalance: 1,
                    "referredPeople.name": 1,
                    "referredPeople._id": 1,
                    "referredPeople.phoneNo": 1,
                    "referredPeople.date": 1,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    phoneNo: { $first: "$phoneNo" },
                    date: { $first: "$date" },
                    address: { $first: "$address" },
                    referredBy: { $first: "$referredBy" },
                    referralBonusGiven: { $first: "$referralBonusGiven" },
                    referralCode: { $first: "$referralCode" },
                    isDisabled: { $first: "$isDisabled" },
                    isSoftDelete: { $first: "$isSoftDelete" },
                    otp: { $first: "$otp" },
                    orders: { $first: "$orders" },
                    peopleReferred: { $push: "$referredPeople" },
                    walletBalance: { $first: "$walletBalance" },
                },
            },
            {
                $lookup: {
                    from: "wallettransactions",
                    let: { user_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", "$$user_id"] },
                                        { $eq: ["$status", "success"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "walletTransactions",
                },
            },
            {
                $unwind: {
                    path: "$walletTransactions",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    phoneNo: 1,
                    date: 1,
                    referredBy: 1,
                    referralBonusGiven: 1,
                    referralCode: 1,
                    isDisabled: 1,
                    isSoftDelete: 1,
                    address: 1,
                    otp: 1,
                    orders: 1,
                    peopleReferred: 1,
                    walletBalance: 1,
                    "walletTransactions.id": 1,
                    "walletTransactions.orderId": 1,
                    "walletTransactions.userId": 1,
                    "walletTransactions.sellerId": 1,
                    "walletTransactions.tempOrderId": 1,
                    "walletTransactions.transactionId": 1,
                    "walletTransactions.status": 1,
                    "walletTransactions.type": 1,
                    "walletTransactions.description": 1,
                    "walletTransactions.paymentMode": 1,
                    "walletTransactions.amount": 1,
                    "walletTransactions.created": 1,
                    "walletTransactions.updated": 1,
                    "walletTransactions.date": 1,
                    "walletTransactions.message": 1,
                },
            },
            {
                $sort: { "walletTransactions.date": -1 },
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    phoneNo: { $first: "$phoneNo" },
                    date: { $first: "$date" },
                    address: { $first: "$address" },
                    referredBy: { $first: "$referredBy" },
                    referralBonusGiven: { $first: "$referralBonusGiven" },
                    referralCode: { $first: "$referralCode" },
                    isDisabled: { $first: "$isDisabled" },
                    isSoftDelete: { $first: "$isSoftDelete" },
                    otp: { $first: "$otp" },
                    orders: { $first: "$orders" },
                    peopleReferred: { $first: "$peopleReferred" },
                    walletTransactions: { $push: "$walletTransactions" },
                    walletBalance: { $first: "$walletBalance" },
                },
            },
        ];

        crud.aggregation(conditions, userSchema, (err, users) => {
            if (err) {
                console.log("Error occurred in fetching user details", err);
                return res.status(400).json({
                    message: "Error occurred in fetching user details",
                    err,
                });
            } else if (users && users[0]) {
                return res.status(200).json({
                    success: true,
                    message: "User details found",
                    user: users[0],
                });
            } else {
                return res.status(201).json({
                    success: false,
                    message: "User details not found",
                });
            }
        });
    },
];
