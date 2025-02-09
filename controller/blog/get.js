let crudModel = require("../../sharedmb/models/crud"),
    blogSchema = require("../../sharedmb/schema/blog");

module.exports = [
    (req, res) => {
        crudModel.findOne(
            { _id: req.params.blogId },
            blogSchema,
            (err, blog) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        success: false,
                        message: "error occured in findadminblog",
                        err,
                    });
                }
                if (blog) {
                    return res.status(200).json({
                        success: true,
                        message: " data found",
                        blog: blog,
                    });
                } else
                    return res
                        .status(201)
                        .json({ success: false, message: " No data found" });
            }
        );
    },
];
