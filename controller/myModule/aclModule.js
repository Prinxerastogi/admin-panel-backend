let acl = require("acl"),
    mongoose = require("mongoose"),
    aclmongoBackend = new acl(
        new acl.mongodbBackend(mongoose.connection.db, "acl_", true)
    );

module.exports = aclmongoBackend;
