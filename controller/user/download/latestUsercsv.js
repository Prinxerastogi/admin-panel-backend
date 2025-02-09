let schema = require("../../../sharedmb/schema/user");
let crud = require("../../../sharedmb/models/crud");
const stringify = require("csv-stringify");

let findLatestuser = (req, res, next) => {
    crud.aggregation(
        [
            {
                $match: {
                    $or: [{ isEmailVerify: true }, { isPhoneVerify: true }],
                },
            },
            {
                $sort: {
                    created: -1,
                },
            },
            {
                $limit: Number(req.query.limit),
            },
            {
                $project: {
                    email: 1,
                    phoneNo: 1,
                    _id: 0,
                },
            },
        ],
        schema,
        (err, users) => {
            if (err)
                return res
                    .status(400)
                    .json({ message: "error occured in userlist", err });
            else if (users && users.length > 0) {
                req.data = { users };
                next();
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: "user list  not found" });
            }
        }
    );
};

//mongoexport --host 13.232.28.94 --username mbGroceryProdUser --password WotSIIB5NplbLy5S --db groceryMB --collection users --type=csv --fields email,phoneNo,isEmailVerify,isPhoneVerify --out /home/saurabh/Desktop/morningBag/list/userList.csv
let sendCSv = (req, res) => {
    try {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="' +
                "download-" +
                `${new Date().getTime}` +
                '.csv"'
        );
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Pragma", "no-cache");
        // parse(req.data.response, opts).pipe(res);
        stringify(req.data.users, { header: true }).pipe(res);
        // res.send(csv)
    } catch (err) {
        console.error(err);
    }
};

module.exports = [findLatestuser, sendCSv];
