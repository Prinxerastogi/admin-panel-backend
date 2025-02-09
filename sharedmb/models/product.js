module.exports.findOne = function (conditions, schema, callBack) {
    schema.findOne(conditions, function (error, data) {
        data.setNext("inhabitant_seq", function (err, product) {
            if (err) {
                callBack(true, null);
            } else {
                callBack(null, product);
            }
        });
    });
};
