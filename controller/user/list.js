let userSchema = require("../../sharedmb/schema/user");
let crud = require("../../sharedmb/models/crud");

let userList = (req, res) => {
    let pagination = {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
    };
    let value = req.query.keyword;

    let matchValue = [];
    if (isNaN(Number(value))) {
        matchValue.push(
            { email: { $regex: value } },
            { name: { $regex: value } }
        );
    } else {
        matchValue.push({ phoneNo: Number(value) }, { id: Number(value) });
    }

    let search = [
        {
            $match: {
                $and: [
                    {
                        $or: matchValue,
                    },
                ],
            },
        },
    ];
    let aggregate = [
        {
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "userId",
                as: "orders",
            },
        },
        {
            $limit: 1000,
        },
        {
            $addFields: {
                totalOrder: {
                    $size: "$orders",
                },
                cartLength: {
                    $size: "$cart",
                },
            },
        },
        {
            $project: {
                totalOrder: 1,
                cartLength: 1,
                name: 1,
                address: 1,
                balance: 1,
                id: 1,
                phoneNo: 1,
                email: 1,
            },
        },
    ];

    if (req.query.sort && req.query.order) {
        let sort = {};
        sort[req.query.sort] = Number(req.query.order);
        aggregate.push({
            $sort: sort,
        });
    }

    let paginate = [
        {
            $skip: pagination.page * pagination.limit,
        },
        {
            $limit: pagination.limit,
        },
    ];
    if (value) {
        aggregate = [...search, ...aggregate];
    }
    aggregate = [...aggregate, ...paginate];
    crud.aggregation(aggregate, userSchema, (err, users) => {
        if (err)
            return res
                .status(400)
                .json({ message: "error occured in userlist", err });
        else if (users && users.length > 0)
            return res
                .status(200)
                .json({ success: true, message: "list found", users: users });
        return res
            .status(201)
            .json({ success: false, message: "user list  not found" });
    });
};

module.exports = [userList];
