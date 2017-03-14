var MongoClient = require("mongodb").MongoClient;
var db_config = require("./config");
var serializeObject = require("../utils/serialize").serializeObject;
var payments = require("./pending");

function Account(options) {
    options = options || {};
    if (!options.billingId || !options.credit)
        throw "Missing required fields";
    this.billingId = options.billingId;
    this.credit = options.credit || 0;
    this._id = options._id;
    if (!this._id) {
        var that = this;
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection = db.collection(db_config.ACCOUNT_COLLECTION_URL);
            collection.insert(serializeObject(that), function(err, result) {
                that._id = result.insertedId;
            });
        })
    }
}

Account.prototype.applyCredit = function(PendingPayment, amount, resolve) {
    if (amount > this.credit) {
        throw "Credit cannot be pushed below zero";
    }
    this.credit -= amount;
    var payment = new payments.Payment({
        amount: amount,
    });
    var that = this;
    PendingPayment.applyPayment(payment, function(returnedCredit) {
        that.credit += returnedCredit;
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection = db.collection(db_config.ACCOUNT_COLLECTION_URL);
            collection.update({_id: that._id}, serializeObject(that), function() {
                resolve();
            });
        });
    });
}

Account.serializeConfig = [
    "billingId",
    "credit",
];


function Session(options, resolve) {
    options = options || {};
    if (!options.billingId || !options.sessionId) {
        throw "Missing required fields";
    }
    this.billingId = options.billingId;
    this.sessionId = options.sessionId;
    this._id = options._id;
    if (!this._id) {
        var that = this;
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection = db.collection(db_config.SESSION_COLLECTION_URL);
            collection.insert(serializeObject(that), function(err, result) {
                that._id = result.insertedId;
                if (resolve) resolve(result.insertedId);
            });
        });
    }
}

Session.serializeConfig = [
    "billingId",
    "sessionId",
];

function getSessionById(sessionId, resolve) {
    MongoClient.connect(db_config.DB_URL, function(err, db) {
        var collection = db.collection(db_config.SESSION_COLLECTION_URL);
        collection.findOne({sessionId: sessionId}).then(function(result) {
            if (resolve) resolve(new Session(result));
        });
    });
}


module.exports = {
    Account: Account,
    Session: Session,
}