var MongoClient = require("mongodb").MongoClient;
var db_config = require("./config");
var serializeObject = require("../utils/serialize").serializeObject;


function Client(options) {
    options = options || {};
    if (!options.clientId || !options.redirectURI) {
        throw "Missing required fields";
    }
    this.clientId = options.clientId;
    this.redirectURI = options.redirectURI;
    this.clientName = options.clientName || "Client";
}

Account.serializeConfig = [
    "clientId",
    "redirectURI",
    "clientName",
]


module.exports = {
    Client: Client,
}
