module.exports.add = (page, limit) => {
    let pagination = [];
    pagination.push(
        {
            $group: {
                _id: null,
                total: {
                    $sum: 1,
                },
                blogs: {
                    $push: "$$ROOT",
                },
            },
        },
        {
            $unwind: {
                path: "$data",
            },
        },
        {
            $addFields: {
                "data.total": "$total",
            },
        },
        {
            $replaceRoot: {
                newRoot: "$data",
            },
        },
        {
            $skip: page * limit,
        },
        {
            $limit: limit,
        }
    );

    return pagination;
};
