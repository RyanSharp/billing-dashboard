var express = require("express");
var http = require("request");

var account = require("./models/account");
var config = require("./config");

var app = express();

var invoiceRouting = require("./handlers/invoice");

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

app.use("/invoice", invoiceRouting);