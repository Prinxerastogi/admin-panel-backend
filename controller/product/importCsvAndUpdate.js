const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const sellerProduct = "../../../sharedmb/schema/sellerproduct";
const product = "../../../sharedmb/schema/product";
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("file", file);
        cb(null, "/temp/");
    },
    filename: function (req, file, cb) {
        console.log("file", file);
        cb(null, "importedCsv.csv");
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

        const filePath = "/temp/importedCsv.csv";

        // row name sellerProductId	ManufacturerDetails	Country	ExpiryMonth
        // Read CSV file and update documents
        try {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", async (row) => {
                    try {
                        const singleDoc = await sellerProduct.findOne({
                            _id: ObjectId(row.sellerProductId),
                        });
                        await product.updateOne(
                            {
                                _id: ObjectId(singleDoc.productId),
                            },
                            {
                                $set: {
                                    manufacturerDetails:
                                        row.ManufacturerDetails,
                                    country: row.Country,
                                    expiryMonth: row.ExpiryMonth,
                                    fssaiNo: row.FSSAI,
                                },
                            }
                        );
                    } catch (err) {
                        console.error("Error updating document:", err);
                    }
                })
                .on("end", () => {
                    client.close();
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
