const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const AffiliatePartner = require("../sharedmb/schema/affiliatePartner");
const DATA_DIR = path.join(__dirname, "..", "public", "brochure");
const PDF_PATH = path.join(DATA_DIR, "template.pdf");
const JSON_PATH = path.join(DATA_DIR, "template.json");
const GENERATED_DIR = path.join(DATA_DIR, "generated");

fs.mkdir(GENERATED_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DATA_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, "template.pdf");
    },
});
exports.upload = multer({ storage: storage });

exports.uploadPdf = (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    res.json({
        message: "PDF uploaded successfully",
        path: "/api/admin/public/brochure/template.pdf",
    });
};

exports.saveFields = async (req, res) => {
    try {
        const { fields, fontFile } = req.body;
        if (!fields || !fontFile) {
            return res.status(400).send("Missing fields or fontFile.");
        }
        const config = {
            basePdf: "/api/admin/public/brochure/template.pdf",
            fontFile: fontFile,
            fields: fields,
        };
        await fs.writeFile(JSON_PATH, JSON.stringify(config, null, 2), "utf-8");
        res.json({ message: "Template fields saved successfully." });
    } catch (error) {
        console.error("Error saving fields:", error);
        res.status(500).send("Error saving fields.");
    }
};

exports.loadFields = async (req, res) => {
    try {
        const config = JSON.parse(await fs.readFile(JSON_PATH, "utf-8"));
        res.json(config);
    } catch (error) {
        res.json({
            fontFile: "/fonts/Poppins-SemiBold.ttf",
            fields: [],
            basePdf: "/api/admin/public/brochure/template.pdf",
        });
    }
};

exports.sendBulkWhatsApp = async (req, res) => {
    console.log("Starting bulk WhatsApp send process...");
    res.json({
        success: true,
        message: "Started sending brochures. Check server logs for progress.",
    });

    try {
        let config;
        let templatePdfBytes;
        try {
            config = JSON.parse(await fs.readFile(JSON_PATH, "utf-8"));
            templatePdfBytes = await fs.readFile(PDF_PATH);
        } catch (readError) {
            console.error(
                "[WhatsApp Send] Error loading template files:",
                readError
            );
            return;
        }

        const partners = await AffiliatePartner.find({}).limit(10).lean();
        console.log(
            `[WhatsApp Send] Found ${partners.length} partners to process.`
        );
        if (!partners || partners.length === 0) {
            console.log("[WhatsApp Send] No partners found.");
            return;
        }

        let customFont;
        let fontBytes;
        try {
            const fontPath = path.join(
                __dirname,
                "..",
                "..",
                "adminpanel",
                "public",
                config.fontFile
            );
            fontBytes = await fs.readFile(fontPath);
        } catch (fontError) {
            console.warn(
                `[WhatsApp Send] WARN: Could not read font file. Using Helvetica. Error: ${fontError.message}`
            );
        }

        for (const partner of partners) {
            try {
                console.log(
                    `[WhatsApp Send] Processing partner ID: ${partner._id}`
                );

                const personalizationData = {
                    shopName: `Shop ${partner.id || partner._id}`,
                    tagline: "Your Friendly Local Store",
                    phoneNumber: partner.phone || "",
                };
                const targetWhatsAppNumber = "9654760035";

                const pdfDoc = await PDFDocument.load(templatePdfBytes);
                pdfDoc.registerFontkit(fontkit);

                if (fontBytes) {
                    customFont = await pdfDoc.embedFont(fontBytes);
                } else {
                    customFont = await pdfDoc.embedFont("Helvetica");
                }

                const pages = pdfDoc.getPages();

                for (const field of config.fields) {
                    const text = personalizationData[field.name];

                    if (
                        text !== undefined &&
                        text !== null &&
                        String(text).trim() !== ""
                    ) {
                        const page = pages[field.page - 1];
                        if (!page) {
                            console.warn(
                                `[WhatsApp Send] Invalid page ${field.page} for field ${field.name}. Skipping.`
                            );
                            continue;
                        }

                        if (field.box && field.maxFontSize) {
                            const boxWidth =
                                (field.box.right - field.box.left) * 0.98;
                            let currentFontSize = field.maxFontSize;
                            let textWidth = customFont.widthOfTextAtSize(
                                String(text),
                                currentFontSize
                            );

                            if (textWidth > boxWidth) {
                                const scaleFactor = boxWidth / textWidth;
                                currentFontSize = currentFontSize * scaleFactor;
                                textWidth = customFont.widthOfTextAtSize(
                                    String(text),
                                    currentFontSize
                                );
                            }

                            const boxCenterX =
                                field.box.left +
                                (field.box.right - field.box.left) / 2;
                            const drawX = boxCenterX - textWidth / 2;

                            page.drawText(String(text), {
                                x: drawX,
                                y: field.box.y,
                                size: currentFontSize,
                                font: customFont,
                                color: rgb(
                                    field.color[0],
                                    field.color[1],
                                    field.color[2]
                                ),
                            });
                            console.log(
                                `[WhatsApp Send] Drew (Box) '${
                                    field.name
                                }' at (X:${drawX.toFixed(0)}, Y:${
                                    field.box.y
                                }) with size ${currentFontSize.toFixed(1)}`
                            );
                        } else if (field.x && field.y) {
                            page.drawText(String(text), {
                                x: parseFloat(field.x) || 0,
                                y: parseFloat(field.y) || 0,
                                size: parseFloat(field.fontSize) || 12,
                                font: customFont,
                                color:
                                    Array.isArray(field.color) &&
                                    field.color.length === 3
                                        ? rgb(
                                              field.color[0],
                                              field.color[1],
                                              field.color[2]
                                          )
                                        : rgb(0, 0, 0),
                            });
                            console.log(
                                `[WhatsApp Send] Drew (Legacy) '${field.name}' at (X:${field.x}, Y:${field.y})`
                            );
                        }
                    }
                }

                const personalizedPdfBytes = await pdfDoc.save();
                console.log(`---> [WhatsApp Send] SIMULATING SEND <---`);
                console.log(`   - To: ${targetWhatsAppNumber}`);
                console.log(
                    `   - PDF Size: ${personalizedPdfBytes.length} bytes`
                );
                console.log(`---> [WhatsApp Send] END SIMULATION <---`);

                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (partnerError) {
                console.error(
                    `[WhatsApp Send] Error processing partner ${partner._id}:`,
                    partnerError
                );
            }
        }

        console.log("[WhatsApp Send] Finished bulk send process.");
    } catch (error) {
        console.error("[WhatsApp Send] Critical error:", error);
    }
};
