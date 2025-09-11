const { Types } = require("mongoose");
const deliveryBoySchema = require("../../sharedmb/schema/deliveryBoy");
const config = require("../../config/development.json");
const withdrawalSchema = require("../../sharedmb/schema/deliveryPartnerWithdrawal");
const axios = require("axios");
const crypto = require("crypto");
const deliveryBoyTransactionSchema = require("../../sharedmb/schema/deliveryBoyTransactions");

const getRequestInfo = async (req, res, next) => {
    try {
        req.data = {};
        const { _id } = req.body;

        if (!Types.ObjectId.isValid(_id)) {
            return res.json({ success: false, message: "Invalid ID format" });
        }

        const request = await withdrawalSchema.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(_id),
                    status: "pending",
                },
            },
            {
                $lookup: {
                    from: "deliveryboys",
                    localField: "deliveryPartnerId",
                    foreignField: "_id",
                    as: "deliveryPartner",
                },
            },
            {
                $unwind: "$deliveryPartner",
            },
            {
                $project: {
                    created: 1,
                    _id: 1,
                    id: 1,
                    status: 1,
                    amount: 1,
                    deliveryPartnerId: 1,
                    name: "$deliveryPartner.name",
                    phoneNo: "$deliveryPartner.phoneNo",
                    floatingCash: "$deliveryPartner.floatingCash",
                    currentBalance: "$deliveryPartner.currentBalance",
                    easeBuzzBenificiaryId:
                        "$deliveryPartner.easeBuzzBenificiaryId",
                },
            },
        ]);

        if (!request.length) {
            return res.json({ success: false, message: "Invalid Request" });
        }

        if (request[0].floatingCash > 500) {
            return res.json({
                success: false,
                message: "Floating balance more than 500rs",
            });
        }
        if (!request[0].easeBuzzBenificiaryId) {
            return res.json({ success: false, message: "Invalid Account No" });
        }

        req.data.request = request[0];

        if (request[0].amount > request[0].currentBalance) {
            req.data.request.amount = request[0].currentBalance;
        }
        const update = await withdrawalSchema.findOneAndUpdate(
            { _id: new Types.ObjectId(req.body._id) },
            { $set: { amount: req.data.request.amount } }
        );

        const result = await deliveryBoySchema.findOneAndUpdate(
            {
                _id: new Types.ObjectId(request[0].deliveryPartnerId),
                currentBalance: { $gte: req.data.request.amount },
            },
            {
                $inc: { currentBalance: -req.data.request.amount },
            }
        );
        req.data.oldBalance = result.currentBalance;
        next();
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Unable to find transaction",
        });
    }
};

const initiateTransfer = async (req, res, next) => {
    const unique_request_number = `AKBDEL${req.data.request.id.toString()}`;
    const amount = Math.round(req.data.request.amount * 99) / 100;
    const beneficiary_code = req.data.request.easeBuzzBenificiaryId;

    const toHash = `${process.env.wireKey}|${beneficiary_code}|${unique_request_number}|${amount}|${process.env.wireSalt}`;
    const auth = crypto.createHash("sha512").update(toHash).digest("hex");

    const options = {
        method: "POST",
        url: "https://wire.easebuzz.in/api/v1/transfers/initiate/",
        headers: {
            Authorization: auth,
            "WIRE-API-KEY": process.env.wireKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        data: {
            key: process.env.wireKey,
            virtual_account_number: process.env.virtualAccountNo,
            beneficiary_code: beneficiary_code,
            unique_request_number: unique_request_number,
            payment_mode: "IMPS",
            amount: amount,
            narration: `Transfer to ${req.data.request.phoneNo}`,
            udf1: "Initiatetransfertest",
        },
    };

    console.log(options.data);

    try {
        const { data } = await axios.request(options);
        console.log(data);
        if (data.success) {
            res.json({ success: true, message: "Request Approved" });
            const update = await withdrawalSchema.findOneAndUpdate(
                { _id: new Types.ObjectId(req.body._id) },
                {
                    $set: {
                        status: "success",
                        response: data.data.transfer_request,
                        actionDate: new Date(),
                    },
                }
            );

            const transaction = await deliveryBoyTransactionSchema.create([
                {
                    type: "debit",
                    deliveryPartnerId: req.data.request.deliveryPartnerId,
                    created: new Date(),
                    updated: new Date(),
                    amount: req.data.request.amount,
                    openingBalance: req.data.oldBalance,
                    closingBalance:
                        req.data.oldBalance - req.data.request.amount,
                    remarks: "withdrawn",
                },
            ]);
        } else {
            const result = await deliveryBoySchema.findOneAndUpdate(
                {
                    _id: new Types.ObjectId(req.data.request.deliveryPartnerId),
                },
                {
                    $inc: { currentBalance: req.data.request.amount },
                }
            );
            return res.json({ success: false, message: "Unable to transfer" });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "Unable to transfer" });
    }
};

module.exports = [getRequestInfo, initiateTransfer];
