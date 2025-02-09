let gm = require("gm").subClass({ imageMagick: true });
let async = require("async");

module.exports = (dstPath, image, callback) => {
    let imageName = image.split(".").slice(0, -1).join(".");
    let imageExt = image.split(".").pop();
    let DBPushData = [];
    console.log(dstPath, image);

    DBPushData.push(
        function (callback1) {
            gm(`${dstPath}${image}`)
                .resize(24, 24)
                .quality(100)
                .write(
                    `${dstPath}${imageName}-24x24.${imageExt}`,
                    function (err, updated) {
                        callback1(err, updated);
                    }
                );
        },
        function (callback2) {
            gm(`${dstPath}${image}`)
                .resize(60, 60)
                .quality(100)
                .write(
                    `${dstPath}${imageName}-60x60.${imageExt}`,
                    function (err, updated) {
                        callback2(err, updated);
                    }
                );
        },
        function (callback3) {
            gm(`${dstPath}${image}`)
                .resize(120, 120)
                .quality(100)
                .write(
                    `${dstPath}${imageName}-120x120.${imageExt}`,
                    function (err, updated) {
                        callback3(err, updated);
                    }
                );
        },
        function (callback4) {
            gm(`${dstPath}${image}`)
                .resize(200, 200)
                .quality(100)
                .write(
                    `${dstPath}${imageName}-200x200.${imageExt}`,
                    function (err, updated) {
                        callback4(err, updated);
                    }
                );
        },
        function (callback5) {
            gm(`${dstPath}${image}`)
                .resize(400, 400)
                .quality(100)
                .write(
                    `${dstPath}${imageName}-400x400.${imageExt}`,
                    function (err, updated) {
                        callback5(err, updated);
                    }
                );
        },
        function (callback6) {
            gm(`${dstPath}${image}`)
                .resize(500, 500)
                .quality(100)
                .write(
                    `${dstPath}${imageName}-500x500.${imageExt}`,
                    function (err, updated) {
                        callback6(err, updated);
                    }
                );
        }
    );
    async.parallel(DBPushData, (err, results) => {
        if (err) {
            console.log("error here", err, "error msg", err.message);
            callback(err, null);
        } else callback(null, results);
    });
};
