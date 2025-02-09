let userSchema = require("../../sharedmb/schema/user");
let async = require("async");
let crudModel = require("../../sharedmb/models/crud");

// new CronJob("0 34 19 * * *", function () {
//     console.log('Cron Job started for findproductCronTime');
//     findAllproducts()
// }, null, true, 'Asia/Kolkata');

let findAllUser = () => {
    let condition = [
        {
            $match: {
                date: null,
            },
        },
        {
            $addFields: {
                date: {
                    $add: [
                        new Date("Thu, 01 Jan 1970 00:00:00 GMT"),
                        "$created",
                    ],
                },
            },
        },
    ];
    crudModel.aggregation(condition, userSchema, (err, users) => {
        if (err) {
            console.log(err);
        } else if (users && users.length > 0) {
            updateUser(users);
        }
    });
};

let updateUser = (users) => {
    async.each(
        users,
        (user, callback) => {
            let condition = {
                _id: user._id,
            };
            let update = {
                $set: {
                    date: user.date,
                },
            };
            let Option = {};
            crudModel.updateOne(
                condition,
                update,
                Option,
                userSchema,
                (err, updated) => {
                    if (err) {
                        callback({
                            error: true,
                            success: false,
                            message: "error occured in upadte price",
                        });
                    } else {
                        callback();
                    }
                }
            );
        },
        (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("all done");
            }
        }
    );
};

//findAllUser();
