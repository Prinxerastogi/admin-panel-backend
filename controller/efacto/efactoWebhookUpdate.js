const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const efactoUsers = require("../../sharedmb/schema/efactoUsers");
const efactoInvoices = require("../../sharedmb/schema/efactoInvoices");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "/tmp/"),
    filename: (req, file, cb) => cb(null, "efactoInvoices.csv"),
});

const csvFilter = (req, file, cb) => {
    file.mimetype.includes("csv")
        ? cb(null, true)
        : cb("Only CSVs allowed", false);
};

const upload = multer({ storage, fileFilter: csvFilter });

module.exports = [
    upload.single("csvFile"),
    async (req, res) => {
        if (!req.file) return res.status(400).send("No file uploaded.");

        const filePath = "/tmp/efactoInvoices.csv";
        const rows = [];

        try {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => rows.push(row))
                .on("end", async () => {
                    let errProds = [],
                        successProds = 0;

                    for (const row of rows) {
                        try {
                            const phoneStr = String(row.phoneNo || "").replace(
                                /\D/g,
                                ""
                            );
                            const phoneNo =
                                phoneStr.length >= 10
                                    ? phoneStr.slice(-10)
                                    : null;
                            const amountStr = (row.amount || "").replace(
                                /,/g,
                                ""
                            );
                            const amount = amountStr.includes(".")
                                ? parseFloat(amountStr)
                                : parseInt(amountStr, 10);

                            if (!phoneNo || isNaN(amount)) {
                                errProds.push({
                                    row,
                                    reason: "Invalid phoneNo or amount",
                                });
                                continue;
                            }

                            const existing = await efactoInvoices.findOne({
                                invoiceNo: row.invoiceNo,
                            });
                            if (existing) continue;

                            const [day, month, year] = (row.date || "").split(
                                "/"
                            );
                            const date = new Date(`${year}-${month}-${day}`);

                            await efactoUsers.findOneAndUpdate(
                                { phoneNo },
                                { $inc: { totalPurchase: amount } },
                                { upsert: true, new: true }
                            );

                            await efactoInvoices.create({
                                phoneNo,
                                invoiceNo: row.invoiceNo,
                                amount,
                                date,
                            });

                            successProds++;
                        } catch (err) {
                            errProds.push({ row, reason: err.message });
                        }
                    }

                    fs.unlinkSync(filePath);
                    return res.json({
                        message: "CSV processed",
                        successCount: successProds,
                        errorCount: errProds.length,
                        errors: errProds,
                    });
                });
        } catch (err) {
            console.error("Processing error:", err);
            return res.status(500).send("Failed to process CSV file.");
        }
    },
];
