const HomeScreenCard = require("../../sharedmb/schema/HomeScreenCard");
const crudModel = require("../../sharedmb/models/crud");
const mongoose = require("mongoose");
const fs = require("fs-extra");
const async = require("async");
const config = require("config");
const {
    deleteRedisCache,
    deleteHomePageRedisCache,
} = require("../../library/redis");

const uploadImage = async (req, res, next) => {
    try {
        if (!req.body.image) {
            return next();
        }
        let tempImages = req.body.image
            ?.filter((image) => image.tempimgUrl)
            ?.map((image) => image.tempimgUrl);
        let dstPath = `${config.upload.banner}`;

        await fs.ensureDir(dstPath);
        await Promise.all(
            tempImages?.map(async (image) => {
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

const updateMongo = async (req, res) => {
    try {
        let body = req.body;

        crudModel.findByIdAndUpdate(
            body._id,
            body,
            { new: true },
            HomeScreenCard,
            (err, result) => {
                if (err) throw err;
                else {
                    deleteHomePageRedisCache();
                    return res.json({
                        message: "HomeScreenCard updated successfully",
                        data: result,
                    });
                }
            }
        );
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = [uploadImage, updateMongo];
