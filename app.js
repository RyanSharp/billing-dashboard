var express = require("express");
var bodyParser = require("body-parser");
var http = require("request");

var pending = require("./models/pending");
var account = require("./models/account");
var config = require("./config");

var app = express();

app.use(bodyParser.json());

/*
 * Oauth login
 */

app.get("/oauth/new", function(req, resp) {
    var params = {
        redirect_uri: config.REDIRECT_URL,
    };
    var query = Object.keys(params).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    }).join("&");
    resp.redirect(config.AUTH_URL + "?" + query);
});


app.get("/oauth/redirect", function(req, resp) {
    var post_data = {
        code: req.query.code,
        redirect_uri: config.REDIRECT_URL,
    }
    request.post(config.CODE_URL, post_data, function(err, response, body) {
        if (!error && response.statusCode === 200) {
            var session_data = {
                billingId: body.billingId,
                sessionId: body.sessionId,
            };
            new account.Session(session_data);
        }
    });
});

/*
 * Invoices
 */

app.get("/invoice/new", function(req, resp) {
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

app.get("/invoice/pending", function(req, resp) {
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

app.get("/invoice/past", function(req, resp) {
});

/*
 * Payments
 */

app.post("invoice/pay", function(req, resp) {
    var rdict, card_info, amount;
    rdict = {success: false};
    card_info = new pending.CardInfo(req.body.card_info);
    amount = req.body.amount;
});

function getPaypalAccessToken(callback, errorCallback) {
    var url, requestOptions, postData;
    url = "https://" + config.PAYPAL_CLIENT_ID + ":" + config.PAYPAL_CLIENT_SECRET + "@api.sandbox.paypal.com/v1/oauth2/token";
    requestOptions = {
        url: url,
        headers: {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
    }
    postData = {grant_type: "client_credentials"};
    request.post(requestOptions, postData, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            callback(JSON.parse(body));
        } else {
            errorCallback();
        }
    });
}

function preparePaymentForAPI(card_info, amount, description) {
    var rdict = {};
    rdict.intent = "sale";
    rdict.payer = {
        payment_method: "credit_card",
        funding_instrumnets: [{
            credit_card: card_info
        }]
    };
    rdict.transactions = [{
        amount: amount,
        description: description,
    }];
    return rdict;
}