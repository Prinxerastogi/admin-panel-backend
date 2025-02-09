module.exports.OMBId = {
    $addFields: {
        MBId: {
            $concat: [
                "O",
                {
                    $substr: [
                        {
                            $year: "$date",
                        },
                        2,
                        4,
                    ],
                },
                {
                    $cond: [
                        {
                            $lte: [
                                {
                                    $month: "$date",
                                },
                                9,
                            ],
                        },
                        {
                            $concat: [
                                "0",
                                {
                                    $substr: [
                                        {
                                            $month: "$date",
                                        },
                                        0,
                                        2,
                                    ],
                                },
                            ],
                        },
                        {
                            $substr: [
                                {
                                    $month: "$date",
                                },
                                0,
                                2,
                            ],
                        },
                    ],
                },
                {
                    $cond: [
                        {
                            $lte: [
                                {
                                    $dayOfMonth: "$date",
                                },
                                9,
                            ],
                        },
                        {
                            $concat: [
                                "0",
                                {
                                    $substr: [
                                        {
                                            $dayOfMonth: "$date",
                                        },
                                        0,
                                        2,
                                    ],
                                },
                            ],
                        },
                        {
                            $substr: [
                                {
                                    $dayOfMonth: "$date",
                                },
                                0,
                                2,
                            ],
                        },
                    ],
                },
                {
                    $toString: "$id",
                },
            ],
        },
    },
};
