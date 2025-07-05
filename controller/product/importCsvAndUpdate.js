const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
// const sellerProductSchema = require("../../sharedmb/schema/sellerproduct");
const productSchema = require("../../sharedmb/schema/product");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("file", file);
        cb(null, "/tmp/");
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

        const filePath = "/tmp/importedCsv.csv";

        // row name sellerProductId	ManufacturerDetails	Country	ExpiryMonth
        // Read CSV file and update documents
        try {
            let errProds = [];
            let successProds = 0;
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", async (row) => {
                    try {
                        let updateBlock = {};
                        if (row?.barCode && row?.barCode2) {
                            updateBlock["$set"] = {
                                altBarCodes: [row.barCode, row.barCode2],
                            };
                        } else if (row?.barCode && !row?.barCode2) {
                            updateBlock["$set"] = {
                                altBarCodes: [row.barCode],
                            };
                        } else if (!row?.barCode && row?.barCode2) {
                            updateBlock["$set"] = {
                                altBarCodes: [row.barCode2],
                            };
                        } else {
                            errProds.push(row?.hsnCode);
                        }
                        productSchema
                            .findOneAndUpdate(
                                { hsnCode: row?.hsnCode },
                                updateBlock
                            )
                            .then((doc) => {
                                if (doc) {
                                    successProds++;
                                } else {
                                    errProds.push(row?.hsnCode);
                                }
                            });
                    } catch (err) {
                        console.error("Error updating document:", err);
                    }
                })
                .on("end", () => {
                    console.log("success", successProds);
                    console.log("error", errProds.length);
                    console.log(errProds);
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
