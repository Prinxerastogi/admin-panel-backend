let mongoose = require("mongoose");

let efactoInvoices = mongoose.Schema({
    invoiceNo: { type: String, default: null },
    amount: { type: Number, default: null },
    date: { type: Date, default: null },
    phoneNo: { type: Number, default: null },
});

module.exports = mongoose.model("efactoInvoices", efactoInvoices);
