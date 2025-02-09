const HomeScreenCard = require("../../sharedmb/schema/HomeScreenCard");
const crudModel = require("../../sharedmb/models/crud");
const fs = require("fs-extra");
const async = require("async");
const config = require("config");
const {
    deleteRedisCache,
    deleteHomePageRedisCache,
} = require("../../library/redis");

const uploadImage = async (req, res, next) => {
    try {
        if (!req.body.image) return next();

        let tempImages = req.body.image
            .filter((image) => image.tempimgUrl)
            .map((image) => image.tempimgUrl);
        let dstPath = `${config.upload.banner}`;

        await fs.ensureDir(dstPath);

        await Promise.all(
            tempImages.map(async (image) => {
                let srcPath = `${config.upload.tempPath}${image}`;
                let dstFilePath = `${dstPath}${image}`;

                try {
                    await fs.access(srcPath);
                    await fs.move(srcPath, dstFilePath);
                } catch (err) {
                    console.error("Error moving file:", err);
                    throw {
                        error: true,
                        success: false,
                        message: "message.banner.add.error.message",
                        err,
                    };
                }
            })
        );

        next();
    } catch (err) {
        console.error("Error in uploadImage:", err);
        res.status(500).json({
            error: true,
            success: false,
            message: "message.banner.add.error.message",
            err,
        });
    }
};

module.exports = [
    uploadImage,
    async (req, res) => {
        try {
            console.log("here");
            let {
                type,
                title,
                categories,
                image,
                categoryItems,
                gifUrl,
                name,
                isDeleted,
                position,
                created,
                updated,
                date,
            } = req.body;

            let data = {};
            if (type === "category") {
                data = {
                    type,
                    title,
                    categories,
                    position,
                    created: new Date().getTime(),
                    updated: new Date().getTime(),
                };
            }
            if (type === "product") {
                data = {
                    type,
                    title,
                    categoryItems,
                    position,
                    created: new Date().getTime(),
                    updated: new Date().getTime(),
                };
            }
            if (type === "gif") {
                data = {
                    type,
                    title,
                    gifUrl,
                    position,
                    created: new Date().getTime(),
                    updated: new Date().getTime(),
                };
            }
            if (
                type === "horizontalbanner" ||
                type === "verticalbanner" ||
                type === "searchpagebanners"
            ) {
                data = {
                    type,
                    title,
                    image,
                    position,
                    created: new Date().getTime(),
                    updated: new Date().getTime(),
                };
            }
            const result = await HomeScreenCard.create(data);
            deleteHomePageRedisCache();
            res.status(200).json({
                message: "HomeScreenCard created successfully",
                data: result,
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
];
