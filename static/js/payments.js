class CardInfo {
    constructor(options) {
        options = options || {};
        this.card_number = options.card_number || null;
        this.type = options.type || null;
        this.expire_month = options.expire_month || null;
        this.expire_year = options.expire_year || null;
        this.cvv2 = options.cvv2 || null;
        this.first_name = options.first_name || null;
        this.last_name = options.last_name || null;
    }
}

class Transaction {
    constructor(options) {
        options = options || {};
        this.amount = options.amount;
        this.currency = options.currency;
    }
}


class Payment {
    constructor(cardInfo, transaction) {
        this.credit_card = cardInfo;
        this.amount = transaction;
    }
}
