var MongoClient = require("mongodb").MongoClient;
var db_config = require("./config");
var serializeObject = require("../utils/serialize").serializeObject;
var pastPayments = require("./history");

function CardInfo(options) {
    options = options || {};
    if (!options.card_number || !options.type || !options.expire_month || !options.expire_year || !options.cvv2 || !options.first_name || !options.last_name) {
        throw "Missing required field(s)"
    }
    this.card_number = options.card_number;
    this.type = options.type;
    this.expire_month = options.expire_month;
    this.expire_year = options.expire_year;
    this.cvv2 = options.cvv2;
    this.first_name = options.first_name;
    this.last_name = options.last_name;
}

CardInfo.serializeConfig = [
    "card_number",
    "type",
    "expire_month",
    "expire_year",
    "cvv2",
    "first_name",
    "last_name",
];


function Payment(options) {
    options = options || {};
    this.amount = options.amount;
    this.postedDate = this.postedDate || new Date();
    this.card_info = options.card_info;
}

Payment.serializeConfig = [
    "amount",
    "postedDate",
];

Payment.nestedProperties = [
    "card_info",
];



function Invoice(options, resolve) {
    var now = new Date();
    var day30 = 30 * 24 * 60 * 60 * 1000;
    var day45 = day30 * 1.5;
    options = options || {};
    if (!options.billingId || !options.invoiceNumber || !options.totalAmount)
        throw "Missing required field(s)";
    this._id = options._id;
    this.billingId = options.billingId;
    this.invoiceNumber = options.invoiceNumber;
    this.created = options.created || new Date();
    this.totalAmount = options.totalAmount;
    this.amountOwed = options.amountOwed || options.totalAmount;
    this.dueDate = options.dueDate || new Date(now + day30);
    this.cancellationDate = options.cancellationDate || new Date(now + day45);
    this.paymentsReceived = [];
    if (options.paymentsReceived)
        this.paymentsReceived = options.paymentsReceived.map(function(payment) {return new Payment(payment)});
    var that = this;
    if (!this._id) {
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection = db.collection(db_config.PENDING_COLLECTION_URL);
            collection.insert(serializeObject(that), function(err, result) {
                that._id = result.insertedId;
                if (resolve) resolve(result.insertedId);
            });
        });
    }
}

Invoice.serializeConfig = [
    "billingId",
    "invoiceNumber",
    "created",
    "totalAmount",
    "amountOwed",
    "dueDate",
    "cancellationDate",
];

Invoice.structuredProperties = [
    "paymentsReceived"
];


Invoice.prototype.applyPayment = function(payment, resolve) {
    this.paymentsReceived.push(payment);
    this.amountOwed -= payment.amount;
    var diff = 0;
    var that = this;
    if (this.amountOwed < 0) {
        // If amount owed reduced to zero, convert to past payment and delete entry
        diff -= this.amountOwed;
        this.amountOwed = 0;
        new pastPayments.PastPayment({
            billingId: this.billingId,
            payment: this
        });
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection;
            collection = db.collection(db_config.PENDING_COLLECTION_URL);
            collection.deleteOne({_id: that._id}, function() {
                resolve(diff);
            });
        });
    } else {
        // Update pendingpayment based on new balance
        MongoClient.connect(db_config.DB_URL, function(err, db) {
            var collection;
            collection = db.collection(db_config.PENDING_COLLECTION_URL);
            collection.update({_id: that._id}, serializeObject(that), function() {
                resolve(diff);
            });
        });
    }
}

function InvoiceList(options) {
    options = options || {};
    if (!options.billingId) {
        throw "Missing required fields";
    }
    this.billingId = options.billingId;
    this.invoices = [];
    this.page = options.page || 0;
    this.limit = options.limit || 10;
}

InvoiceList.prototype.getChunk = function(resolve) {
    var that;
    that = this;
    MongoClient.connect(db_config.DB_URL, function(err, db) {
        var collection = db.collection(db_config.PENDING_COLLECTION_URL);
        collection.find({billingId: that.billingId}).sort([["created", -1]]).skip(that.page * that.limit).limit(that.limit).forEach(function(item) {
            that.invoices.push(new Invoice(item));
        }, function() {
            that.page++;
            resolve();
        })
    })
}

module.exports = {
    Payment: Payment,
    Invoice: Invoice,
}