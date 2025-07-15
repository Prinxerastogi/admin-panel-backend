let chatSchema = require("../../sharedmb/schema/chat");

let chatList = (req, res) => {
    let condition = [
        {
            $match: {
                isDeleted: false,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "order",
            },
        },
        {
            $unwind: {
                path: "$order",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                name: "$user.name",
                mobile: "$user.phoneNo",
                usermobile: {
                    $toString: "$user.phoneNo",
                },
                orderIntId: {
                    $toString: "$order.id",
                },
            },
        },
    ];

    if (req.query.value) {
        condition.push({
            $match: {
                $or: [
                    {
                        usermobile: {
                            $regex: req.query.value,
                        },
                    },
                    {
                        orderIntId: {
                            $regex: req.query.value,
                        },
                    },
                ],
            },
        });
    }

    condition.push(
        {
            $group: {
                _id: "$_id",
                name: {
                    $first: "$name",
                },
                mobile: {
                    $first: "$mobile",
                },
                roomId: {
                    $first: "$roomId",
                },
                messages: {
                    $first: "$messages",
                },
                orderIntId: {
                    $first: "$orderIntId",
                },
                orderId: {
                    $first: "$orderId",
                },
                created: {
                    $first: "$created",
                },
                isNewMsg: {
                    $first: "$isNewMsg",
                },
                isConnected: {
                    $first: "$isConnected",
                },
                userSocketId: {
                    $first: "$userSocketId",
                },
                id: {
                    $first: "$id",
                },
            },
        },
        {
            $sort: {
                id: -1,
            },
        }
    );

    chatSchema.aggregate(condition, (err, response) => {
        if (err) {
            return res.status(400).json({ err: true, message: err.message });
        } else if (response.length > 0) {
            res.status(200).json({
                success: true,
                message: "chats found",
                data: response,
            });
        } else {
            res.status(200).json({
                success: false,
                message: "chats not found",
            });
        }
    });
};

module.exports = [chatList];
