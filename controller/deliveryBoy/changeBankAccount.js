const axios = require("axios");
const crypto = require("crypto");
const deliveryPartnerSchema = require("../../sharedmb/schema/deliveryBoy");
const config = require("../../config/development.json");
const { Types } = require("mongoose");

const verifyBankAccount = async (req, res, next) => {
    try {
        const { account_no, account_holder_name, ifsc, phoneNo } = req.body;
        const result = await deliveryPartnerSchema.findOne({
            phoneNo: phoneNo,
        });

        if (!result) {
            return res.json({ success: false, message: "User not found" });
        }
        req.data = {};
        req.data.wireKey = process.env.wireKey;
        req.data.wireSalt = process.env.wireSalt;
        if (
            result.bankAccountDetails?.account_number === account_no.trim() &&
            result.bankAccountDetails?.ifsc === ifsc.trim()
        ) {
            req.data.bank_account = result.bankAccountDetails;
            next();
        } else {
            const temp = `${req.data.wireKey}|${account_no}|${ifsc}|${req.data.wireSalt}`;
            const auth = crypto.createHash("sha512").update(temp).digest("hex");

            const options = {
                method: "POST",
                url: "https://wire.easebuzz.in/api/v1/beneficiaries/bank_account/verify/",
                headers: {
                    Authorization: auth,
                    "WIRE-API-KEY": req.data.wireKey,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                data: {
                    key: req.data.wireKey,
                    account_no: account_no.trim(),
                    ifsc: ifsc.trim(),
                },
            };

            const { data } = await axios.request(options);
            console.log(data);
            if (!data.success) {
                return res
                    .status(404)
                    .json({ success: false, message: "Something went wrong" });
            }

            if (data.data.is_valid) {
                req.data.bank_account = data.data;
                const updateContact =
                    await deliveryPartnerSchema.findOneAndUpdate(
                        { phoneNo },
                        {
                            $set: {
                                bankAccountDetails: {
                                    isValid: true,
                                    account_name: data.data.account_name,
                                    account_number: data.data.account_number,
                                    ifsc: data.data.ifsc,
                                    percentage_match:
                                        data.data.percentage_match,
                                    verifiedDate: new Date(),
                                },
                            },
                        }
                    );
                if (updateContact) {
                    next();
                } else {
                    return res.status(404).json({
                        success: false,
                        message: "Unable to update user",
                    });
                }
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Bank Account Number not valid",
                });
            }
        }
    } catch (error) {
        console.error("Error in verifying bank account details", error);
        return res.json({ success: false, message: "Something went wrong" });
    }
};

const createContact = async (req, res, next) => {
    try {
        const result = await deliveryPartnerSchema.findOne({
            phoneNo: req.body.phoneNo,
        });

        if (!result) {
            return res.json({ success: false, message: "User not found" });
        }
        if (result.easeBuzzContact?.id) {
            req.data.contact = result.easeBuzzContact;
            next();
        } else {
            let temp = `${req.data.wireKey}|${
                req.data.bank_account.account_name
            }||${req.body.phoneNo.toString()}|${req.data.wireSalt}`;
            const auth = crypto.createHash("sha512").update(temp).digest("hex");
            const options = {
                method: "POST",
                url: "https://wire.easebuzz.in/api/v1/contacts/",
                headers: {
                    Authorization: auth,
                    "WIRE-API-KEY": req.data.wireKey,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                data: {
                    key: req.data.wireKey,
                    name: req.data.bank_account.account_name,
                    email: "",
                    phone: req.body.phoneNo.toString(),
                },
            };

            const { data } = await axios.request(options);
            console.log(data);
            if (data.success) {
                console.log("contact created");
                const updateContact =
                    await deliveryPartnerSchema.findOneAndUpdate(
                        { phoneNo: req.body.phoneNo },
                        {
                            $set: {
                                easeBuzzContact: data.data.contact,
                                floatingCash: 0,
                                currentBalance: 0,
                            },
                        }
                    );
                if (updateContact) {
                    req.data.contact = data.data.contact;
                    next();
                } else {
                    return res.json({
                        success: false,
                        message: "Something went wrong",
                    });
                }
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Unable to create contact",
                });
            }
        }
    } catch (error) {
        console.error("Error in creating contact", error);
        return res.json({ success: false, message: "Something went wrong" });
    }
};

const createBenificiary = async (req, res, next) => {
    let temp = `${req.data.wireKey}|${req.data.contact.id}|${req.data.bank_account.account_name}|${req.data.bank_account.account_number}|${req.data.bank_account.ifsc}||${req.data.wireSalt}`;
    const auth = crypto.createHash("sha512").update(temp).digest("hex");

    console.log("bank_account", req.data.bank_account);
    const options = {
        method: "POST",
        url: "https://wire.easebuzz.in/api/v1/beneficiaries/",
        headers: {
            Authorization: auth,
            "WIRE-API-KEY": req.data.wireKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        data: {
            key: req.data.wireKey,
            contact_id: req.data.contact.id,
            beneficiary_type: "bank_account",
            beneficiary_name: req.data.bank_account.account_name,
            account_number: req.data.bank_account.account_number,
            ifsc: req.data.bank_account.ifsc,
        },
    };

    try {
        const { data } = await axios.request(options);

        console.log(data);
        if (data.success) {
            req.data.beneficiaryId = data.data.beneficiary.id;

            deliveryPartnerSchema
                .findOneAndUpdate(
                    { phoneNo: req.body.phoneNo },
                    {
                        $set: {
                            easeBuzzBenificiaryId: data.data.beneficiary.id,
                        },
                    }
                )
                .then(() => {
                    return res.json({ success: true, message: "verifed" });
                });
        } else {
            console.log(data.message);
            if (
                data.message ===
                "Beneficiary already exists with provided Account Number & IFSC."
            ) {
                return res.status(404).json({
                    success: false,
                    message: "Bank Account already exists",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Unable to create benificiary",
                });
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const id = "contb51ec6f441549e68ddc4f25c0e6d";

const fn = async (req, res) => {
    console.log(`${process.env.wireKey}|${process.env.wireSalt}`);
    const hash = crypto
        .createHash("sha512")
        .update(`${process.env.wireKey}|${id}|${process.env.wireSalt}`)
        .digest("hex");
    console.log(hash);

    const options = {
        method: "GET",
        url: `https://wire.easebuzz.in/api/v1/beneficiaries/`,
        params: { key: process.env.wireKey, contact_id: id },
        headers: {
            Authorization: hash,
            "WIRE-API-KEY": process.env.wireKey,
            Accept: "application/json",
        },
    };

    try {
        const { data } = await axios.request(options);
        console.log(data);
        return res.json(data.data.results);
    } catch (error) {
        console.error(error);
    }
};

module.exports = [fn];
// module.exports = [verifyBankAccount, createContact, createBenificiary];
