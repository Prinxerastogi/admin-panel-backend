let crud = require("../../../sharedmb/models/crud");
let sellerSchema = require("../../../sharedmb/schema/seller");

module.exports = (req, res) => {
    let coordinates = req.body.coordinates;
    // tempCoordinates = [];
    if (coordinates.length == 0) {
        res.status(203).json({
            succes: false,
            message: "no coordinates recieved.",
        });
    } else {
        // for (var i = 0; i < area.length; i++) {
        //     tempCoordinates.push([area[i].lng, area[i].lat]);
        // }
        // tempCoordinates.push([area[0].lng, area[0].lat]);
        // polygon = [];
        // polygon.push(tempCoordinates);
        let condition = {
            _id: req.body.sellerId,
        };
        let update = {
            $set: {
                area: {
                    type: "MultiPolygon",
                    coordinates: coordinates,
                },
            },
        };
        crud.updateOne(condition, update, {}, sellerSchema, (err, updated) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "error occured in assign area of seller",
                    err,
                });
            } else if (updated.n > 0 && updated.nModified > 0) {
                return res.status(200).json({
                    success: true,
                    message: "area update successfully",
                });
            } else {
                return res
                    .status(201)
                    .json({ success: false, message: "area already update" });
            }
        });
    }
};
