let schema = require("../../sharedmb/schema/user");
let crud = require("../../sharedmb/models/crud");

module.exports = [
    (req, res) => {
        // let value = `/^${req.query.value}/i`;
        // console.log(value);
        if (!req.query.value) {
            return res
                .status(201)
                .json({ success: false, message: "valueis required" });
        }
        crud.aggregation(
            [
                {
                    $addFields: {
                        stringPhoneNo: {
                            $toString: {
                                $convert: {
                                    input: "$phoneNo",
                                    to: "decimal",
                                },
                            },
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                email: {
                                    $regex: req.query.value,
                                },
                            },
                            {
                                stringPhoneNo: {
                                    $regex: req.query.value,
                                },
                            },
                        ],
                    },
                },
                {
                    $limit: 20,
                },
            ],
            schema,
            (err, users) => {
                if (err)
                    return res
                        .status(400)
                        .json({ message: "error occured in user search", err });
                else if (users && users.length > 0)
                    return res.status(200).json({
                        success: true,
                        message: "user list found",
                        users: users,
                    });
                return res
                    .status(201)
                    .json({ success: false, message: "user list  not found" });
            }
        );
    },
];
