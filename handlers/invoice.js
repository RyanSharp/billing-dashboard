var express = require("express");
var bodyParser = require("body-parser");

var pending = require("./models/pending");
var paymentUtils = require("../utils/payments");

var router = express.Router();


router.get("/new", bodyParser.json(), function(req, resp) {
    var invoiceData, rdict;
    rdict = {success: false}
    invoiceData = {
        billingId: req.body.billingId,
        invoiceNumber: req.body.invoiceNumber,
        totalAmount: req.body.totalAmount,
        amountOwed: req.body.totalAmount,
        dueDate: req.body.dueDate || null
    }
    try {
        new pending.Invoice(invoiceData, function(_id) {
            rdict.success = true;
            rdict.results = [_id];
            resp.write(JSON.stringify(rdict));
        });
    } catch (error) {
        console.log(error);
        rdict.msg = "Unable to create Invoice";
        resp.write(JSON.stringify(rdict));
    }
});

router.get("/pending", function(req, resp) {
    var invoiceList, rdict;
    rdict = {success: false}
    if (!req.query.billingId) {
        rdict.msg = "Missing required field(s)";
        resp.write(JSON.stringify(rdict));
    } else {
        invoiceList = new pending.InvoiceList({
            billingId = req.query.billingId,
            page = req.query.page || 0,
        });
        invoiceList.getChunk(function(results) {

        });
    }
});

router.get("/past", function(req, resp) {
});

router.post("/pay", bodyParser.json(), function(req, resp) {
    var rdict, card_info, amount;
    rdict = {success: false};
    card_info = new pending.CardInfo(req.body.card_info);
    amount = req.body.amount;
});


module.exports = router;
