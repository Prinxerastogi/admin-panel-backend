const axios = require("axios");
const userSchema = require("../../sharedmb/schema/user");
const walletTransactionSchema = require("../../sharedmb/schema/walletTransaction");

const creditBalanceInUserWallet = async (phoneNos, amount, campaignId) => {
    try {
        const batchSize = 100;
        let results = [];

        for (let i = 0; i < phoneNos.length; i += batchSize) {
            const batch = phoneNos.slice(i, i + batchSize);
            console.log(batch);
            const batchResults = await Promise.allSettled(
                batch.map((phoneNo) =>
                    creditBalance(phoneNo, amount, campaignId)
                )
            );
            results.push(...batchResults);
        }

        console.log(results);
        results.forEach((result) => {
            if (result.status === "rejected") {
                console.error("Failed:", result.reason);
            }
        });
    } catch (error) {
        console.error("Error crediting balance in user wallet:", error);
    }
};

const creditBalance = async (phoneNo, amount, campaignId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await userSchema.findOne({ phoneNo: Number(phoneNo) });
            if (!user) {
                console.error(`User not found for phoneNo ${phoneNo}`);
                return reject(`User not found for phoneNo ${phoneNo}`);
            }

            const now = new Date();
            const walletTransaction = await walletTransactionSchema.create({
                userId: user._id,
                amount: amount,
                type: "credit",
                message: "SPECIAL CASH FOR YOU",
                status: "success",
                created: now,
                updated: now,
                date: now,
                campaignId: campaignId,
            });

            if (!walletTransaction) {
                return reject(`Transaction creation failed for ${phoneNo}`);
            }

            const updatedUser = await userSchema.findOneAndUpdate(
                { phoneNo: phoneNo },
                { $inc: { walletBalance: amount } },
                { new: true }
            );

            if (!updatedUser) {
                return reject(
                    `Transaction created but not credited for ${phoneNo}`
                );
            }

            resolve(`Balance credited for ${phoneNo}`);
        } catch (error) {
            console.error(`Error processing ${phoneNo}:`, error);
            reject(`Error processing ${phoneNo}`);
        }
    });
};

const sendWhatsappMessage = async (
    phoneNos,
    templateName,
    imgUrl,
    wp_variables
) => {
    const concurrencyLimit = 10; // Limit concurrent requests
    let successCount = 0;

    const processBatch = async (batch) => {
        const results = await Promise.allSettled(
            batch.map((phoneNo) =>
                sendSMS(phoneNo, templateName, imgUrl, wp_variables)
            )
        );
        successCount += results.filter(
            (result) => result.status === "fulfilled" && result.value
        ).length;
    };

    for (let i = 0; i < phoneNos.length; i += concurrencyLimit) {
        const batch = phoneNos.slice(i, i + concurrencyLimit);
        await processBatch(batch); // Process each batch sequentially
        process.stdout.write(
            `Completed ${i + batch.length} of ${phoneNos.length} \r`
        );
    }

    console.log(`\nTotal Success Count: ${successCount}`);
};

const sendSMS = async (phoneNo, templateName, imgUrl, variables) => {
    console.log(`Sending SMS to ${phoneNo}`, templateName, imgUrl, variables);
    return new Promise(async (resolve, reject) => {
        let url = `https://api.growaasan.com/api/sendPosCommunication?clietnId=100139&authKey=${process.env.growassan_whatsapp_authKey}&communicationType=2&waTemplateName=${templateName}&waTemplateLang=en&country_code=91&customerMobile=${phoneNo}`;
        if (variables.length > 0) {
            let vars = "";
            variables.forEach((variable, index) => {
                vars += `&var${index + 1}=${variable}`;
            });
            url += `&varCount=${variables.length}${vars}`;
        }
        if (imgUrl) {
            url += `&messageType=image&mediaUrl=${imgUrl}`;
        }
        try {
            // const response = await axios.get(url);
            const response = {
                data: { whatsapp_uniqueid: '{"status":"success"}' },
            };
            console.log(response.data);
            if (
                JSON.parse(response.data.whatsapp_uniqueid).status === "success"
            ) {
                resolve(true);
            } else {
                reject(response.data);
            }
        } catch (error) {
            console.error(`Error sending SMS to ${phoneNo}:`, error);
            reject(error);
        }
    });
};

module.exports = { creditBalanceInUserWallet, sendWhatsappMessage };
