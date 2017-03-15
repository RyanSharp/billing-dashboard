var http = require("request");
var config = require("../config");


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
    http.post(requestOptions, postData, function(err, response, body) {
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