var MongoClient = require("mongodb").MongoClient;
var db_config = require("./config");
var serializeObject = requre("../utils/serialize").serializeObject;

function PastPayment(options) {
    options = options || {};
    if (!options.billingId || !options.payment)
        throw "Missing required fields";
    this.billingId = option.billingId;
    this.payment = options.payment;
    this._id = options._id;
    if (!this._id) {
        var that = this;
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection = db.collection(db_config.HISTORY_COLLECTION_URL);
            collection.insert(serializeObject(that), function(err, result) {
                that._id = result.insertedId;
            });
        });
    }
}

PastPayment.serializeConfig = [
    "billingId",
];

PastPayment.nestedProperties = [
    "payment",
];

function PastPayments(options) {
    options = options || {};
    if (!options.billingId) {
        throw "Missing required fields";
    }
    this.billingId = option.billingId;
    this.page = options.page || 0;
    this.limit = options.limit || 10;
    this.pastPayments = [];
}

PastPayments.prototype.getChunk = function(resolve) {
    var that;
    that = this;
    MongoClient.connect(db_config.DB_URL, function(err, db) {
        var collection = db.collection(db_config.HISTORY_COLLECTION_URL);
        collection.find({billingId: that.billingId}).sort([["created", -1]]).skip(that.page * that.limit).limit(that.limit).forEach(function(item) {
            that.pastPayments.push(new PastPayment(item));
        }, function() {
            that.page++;
            resolve();
        });
    });
}

module.exports = {
    PastPayments: PastPayments,
    PastPayment: PastPayment,
}