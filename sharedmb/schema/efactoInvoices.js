let mongoose = require("mongoose");

let efactoInvoices = mongoose.Schema({
    invoiceNo: { type: Number, default: null },
    amount: { type: Number, default: null },
    date: { type: Date, default: null },
    phoneNo: { type: Number, default: null },
});

module.exports = mongoose.model("efactoInvoices", efactoInvoices);
