const products = require("../../sharedmb/schema/product");
const stringify = require("csv-stringify");

async function fetchAndExport(req, res) {
    try {
        // Fetch all documents from the collection
        const documents = await products.find();

        if (documents.length === 0) {
            console.log("No documents found in the collection.");
            res.status(404).send("No documents found in the collection.");
            return;
        }

        // Get the headers from the document keys
        const headers = Object.keys(documents[0].toObject()).filter(
            (key) => !["seo", "brand", "subBrand"].includes(key)
        );

        console.log("headers", headers);
        headers.push("seo.metaTitle");
        headers.push("seo.metaDescription");
        headers.push("seo.metaKeywords");

        headers.push("brand.image"); // Assuming image is an array (adjust if it's a single value)
        headers.push("brand.name");
        headers.push("brand.id");
        headers.push("subBrand.image"); // Assuming image is an array (adjust if it's a single value)
        headers.push("subBrand.name");
        headers.push("subBrand.id");

        // Set the response headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=products.csv"
        );

        // Create a CSV stringifier
        const stringifier = stringify({ header: true, columns: headers });

        // Pipe the stringifier to the response
        stringifier.pipe(res);

        // Write documents to the stringifier
        documents.forEach((doc) => {
            // Convert Mongoose document to plain JavaScript object
            const {
                seo = {},
                brand = {},
                subBrand = {},
                ...rest
            } = doc.toObject();

            let seoTitle = "";
            let seoDescription = "";
            let seoKeywords = "";
            let brandName = "";
            let brandId = "";
            let subBrandName = "";
            let subBrandId = "";

            if (seo) {
                seoTitle = seo.metaTitle || "";
                seoDescription = seo.metaDescription || "";
                seoKeywords = seo.metaKeywords || "";
            }

            if (brand) {
                brandName = brand.name || "";
                brandId = brand.id || "";
            }

            if (subBrand) {
                subBrandName = subBrand.name || "";
                subBrandId = subBrand.id || "";
            }

            const brandsImage = brand.image ? brand.image.join(",") : ""; // Join image array (adjust if single value)
            const subbrandImage = subBrand.image
                ? subBrand.image.join(",")
                : ""; // Join image array (adjust if single value)

            const restValues = Object.values(rest);
            stringifier.write([
                ...restValues,
                seoTitle,
                seoDescription,
                seoKeywords,
                brandsImage,
                brandName,
                brandId,
                subbrandImage,
                subBrandName,
                subBrandId,
            ]);
        });

        // End the stream
        stringifier.end();
    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).send("An error occurred while exporting data.");
    }
}

module.exports = fetchAndExport;
