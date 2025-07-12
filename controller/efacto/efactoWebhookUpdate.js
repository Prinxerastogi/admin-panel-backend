const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
// const sellerProductSchema = require("../../sharedmb/schema/sellerproduct");
const efactoUsers = require("../../sharedmb/schema/efactoUsers");
const mongoose = require("mongoose");
const efactoInvoices = require("../../sharedmb/schema/efactoInvoices");
const { ObjectId } = mongoose.Types;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("file", file);
        cb(null, "/tmp/");
    },
    filename: function (req, file, cb) {
        console.log("file", file);
        cb(null, "efactoInvoices.csv");
    },
});

const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb("Please upload only CSV file.", false);
    }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

// Express route to handle CSV upload
module.exports = [
    upload.single("csvFile"),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const filePath = "/tmp/efactoInvoices.csv";

        // row name sellerProductId	ManufacturerDetails	Country	ExpiryMonth
        // Read CSV file and update documents
        try {
            let errProds = [];
            let successProds = 0;
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", async (row) => {
                    try {
                        // Sanitize phoneNumber: extract digits, take last 10 digits
                        let phoneNumberStr = String(row.phoneNo || "").replace(
                            /\D/g,
                            ""
                        );
                        let phoneNumber =
                            phoneNumberStr.length >= 10
                                ? Number(phoneNumberStr.slice(-10))
                                : null;

                        // Sanitize purchaseValue: parse as float, ignore decimals
                        let purchaseValue = parseInt(
                            String(row.amount).replace(/[^\d]/g, ""),
                            10
                        );

                        if (!phoneNumber || isNaN(purchaseValue)) {
                            errProds.push(row);
                            return;
                        }
                        let existingInvoice = await efactoInvoices.findOne({
                            invoiceNo: row.invoiceNo,
                        });
                        if (!existingInvoice) {
                            const inputDate = row.date;
                            const [day, month, year] = inputDate.split("/");
                            const formattedDate = new Date(
                                `${year}-${month}-${day}`
                            );
                            const sanitizedAmount = () => {
                                const cleaned = row.amount.replace(/,/g, "");
                                return cleaned.includes(".")
                                    ? parseFloat(cleaned)
                                    : parseInt(cleaned, 10);
                            };

                            await efactoUsers.findOneAndUpdate(
                                {
                                    phoneNo: row.phoneNo,
                                },
                                {
                                    $inc: {
                                        totalPurchase: sanitizedAmount,
                                    },
                                },
                                {
                                    upsert: true,
                                    new: true,
                                }
                            );
                            await efactoInvoices.create({
                                phoneNo: row.phoneNo,
                                invoiceNo: row.invoiceNo,
                                amount: sanitizedAmount,
                                date: formattedDate,
                            });
                        }
                    } catch (err) {
                        console.error("Error updating document:", err);
                    }
                })
                .on("end", () => {
                    console.log("success", successProds);
                    console.log("error", errProds.length);
                    console.log(errProds);
                    // client.close();
                    // Optionally, delete the uploaded file after processing
                    fs.unlinkSync(filePath);
                    res.send("CSV file processed and documents updated.");
                });
        } catch (err) {
            console.error("Error processing CSV file:", err);
            res.status(500).send("Error processing CSV file.");
        }
    },
];
