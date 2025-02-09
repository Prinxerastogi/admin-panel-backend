const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputPath = "/var/www/developmentImage/banner/1718965070612.png";
const outputDirPng = "/tmp";

// Ensure the output directory exists
if (!fs.existsSync(outputDirPng)) {
    fs.mkdirSync(outputDirPng, { recursive: true });
}

// Function to compress an image to PNG and log the sizes
const compressImage = async (inputPath) => {
    const fileName = path.basename(inputPath);
    const outputPathPng = path.join(
        outputDirPng,
        fileName.replace(path.extname(fileName), ".png")
    );
    // const outputPathWebp = path.join(outputDirWebp, fileName.replace(path.extname(fileName), '.webp'));

    try {
        // Compress to PNG
        await sharp(inputPath)
            .png({ compressionLevel: 9 }) // Highest lossless compression for PNG
            .toFile(outputPathPng);

        // Compress to WebP
        // await sharp(inputPath)
        //   .webp({ lossless: true }) // Lossless WebP compression
        //   .toFile(outputPathWebp);

        const originalSize = fs.statSync(inputPath).size;
        const compressedSizePng = fs.statSync(outputPathPng).size;
        // const compressedSizeWebp = fs.statSync(outputPathWebp).size;

        console.log(`Original: ${inputPath} (${originalSize} bytes)`);
        console.log(
            `Compressed PNG: ${outputPathPng} (${compressedSizePng} bytes, reduction: ${(
                100 -
                (compressedSizePng / originalSize) * 100
            ).toFixed(2)}%)`
        );
        // console.log(`Compressed WebP: ${outputPathWebp} (${compressedSizeWebp} bytes, reduction: ${(100 - (compressedSizeWebp / originalSize) * 100).toFixed(2)}%)`);
    } catch (err) {
        console.error(`Error compressing ${inputPath}:`, err);
    }
};

// compressImage(inputPath);
