const campaignSchema = require("../../sharedmb/schema/marketingCampaign");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

// Ensure uploads folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `campaign-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file) {
            return cb(null, true); // Allow request even if there's no file
        }
        if (path.extname(file.originalname).toLowerCase() === ".csv") {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed!"));
        }
    },
});

const createCampaign = async (req, res) => {
    try {
        const {
            templateName,
            name,
            description,
            type,
            amount,
            mainCampaignId,
            wp_imgUrl,
            wp_variables,
        } = req.body;

        // Check if file is required
        if (!req.file && !mainCampaignId) {
            return res.status(400).json({
                message:
                    "CSV file is required when mainCampaignId is not provided!",
            });
        }

        let customers = new Set();

        if (req.file) {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on("data", (row) => {
                    if (!row.phoneNo) {
                        console.log("Invalid row: Missing phoneNo", row);
                        return;
                    }
                    customers.add(row.phoneNo);
                })
                .on("end", async () => {
                    await saveCampaign(res, {
                        name,
                        description,
                        type,
                        amount,
                        mainCampaignId,
                        customers,
                        templateName,
                        wp_imgUrl,
                        wp_variables,
                    });
                })
                .on("error", (error) => {
                    console.error("Error reading CSV:", error);
                    res.status(400).json({
                        message: "Error processing CSV file",
                    });
                });
        } else {
            await saveCampaign(res, {
                name,
                description,
                type,
                amount,
                mainCampaignId,
                customers,
                templateName,
                wp_imgUrl,
                wp_variables,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const saveCampaign = async (
    res,
    { templateName, name, description, type, amount, mainCampaignId, customers }
) => {
    try {
        const campaign = await campaignSchema.create({
            templateName,
            name,
            description,
            type,
            status: "pending",
            amount,
            isMain: !mainCampaignId,
            mainCampaignId,
            targetCustomers: [...customers],
        });

        if (!campaign) {
            return res
                .status(400)
                .json({ success: false, message: "Error creating campaign" });
        }

        res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            campaign,
            targetCustomers: customers.size,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = [upload.single("customerCsvFile"), createCampaign];
