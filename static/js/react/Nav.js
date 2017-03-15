class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        /*
         * Application is too small to justify using routing framework, simple mechanism
         * for handling state changes using the hash of the URL
         * App state is handled on this react element.
         */
        var a = document.createElement("a");
        window.onhashchange = function(e) {
            var hash, query, hashPath;
            a.setAttribute("href", window.location.href);
            hash = a.hash.split("/").slice(1).join("/").split("?");
            query = {};
            hash[1].split("&").map(function(pairs) {
                pairs = pairs.split("=");
                query[decodeURIComponent(paris[0])] = decodeURIComponent(paris[1]);
            });
            this.setState({
                path: hash[0].split("/"),
                params: query,
            });
        }
    }
    loadPastInvoices() {
        /*
         * Recursively load all past invoices for authenticated user
         */
        getPastInvoices(this.state.pastInvoicePage || 0).then(function(results) {
            if (results.length === 0) return;
            var l = this.state.pastInvoiceList || [];
            results.map(function(invoice) {l.push(invoice)});
            this.setState({pastInvoiceList: l, pastInvoicePage: this.state.pastInvoicePage + 1}, this.loadPastInvoices);
        }.bind(this));
    }
    loadInvoiceList() {
        /*
         * Recursively load all pending invoices for authenticated user
         */
        getOutstandingInvoices(this.state.invoicePage || 0).then(function(results) {
            if (results.length === 0) return;
            var l = this.state.invoiceList || [];
            results.map(function(invoice) {l.push(invoice)});
            this.setState({invoiceList: l, invoicePage: this.state.invoicePage + 1}, this.loadInvoiceList);
        }.bind(this));
    }
    renderBodyContent() {
        var appContent = null;
        if (path[0] === "pending") {
            appContent = React.createElement(Table, {
                config: OUTSTANDING_INVOICE_TABLE_CONFIG,
                data: this.state.invoiceList,
            });
        } else if (path[0] === "history") {
            appContent = React.createElement(Table, {
                config: COMPLETED_INVOICE_TABLE_CONFIG,
                data: this.state.pastInvoiceList,
            });
        }
        return appContent;
    }
    render() {
        return (
            React.createElement("div", {className: "app-container"},
                React.createElement(NavBar, null)
            )
        )
    }
}


class NavBar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            React.createElement("div", {className: "nav-bar"},
                React.createElement("div", {className: "nav-bar-button"}, "Outstanding Invoices"),
                React.createElement("div", {className: "nav-bar-button"}, "Past Payments")
            )
        )
    }
}


class Table extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            React.createElement("div", {className: "table-container"},
                React.createElement(TableHeader, {
                    headers: this.props.config
                }),
                React.createElement("div", {className: "table-body"},
                    this.props.data.map(function(row) {
                        return React.createElement(TableRow, {
                            config: this.props.config,
                            data: row,
                        });
                    }.bind(this))
                )
            )
        )
    }
}


class TableHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            React.createElement("div", {className: "table-header"},
                this.props.config.map(function(column) {
                    return (
                        React.createElement("div", {
                            className: column.className
                        }, column.display)
                    )
                }.bind(this))
            )
        )
    }
}


class TableRow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            React.createElement("div", {className: "table-row"},
                this.props.config.map(function(column) {
                    return (
                        React.createElement("div", {
                            className: column.className,
                        }, this.props.data[column.fieldName])
                    )
                }.bind(this))
            )
        )
    }
}


class CardInfoInputForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            card_number: "",
            type: "",
            expire_month: "",
            expire_year: "",
            cvv2: "",
            first_name: "",
            last_name: "",
        }
        var i, currYear;
        this.monthOptions = [];
        this.yearOptions = [];
        for (i=1;i<=12;i++) {
            function zeroPad(num) {
                return (num < 10 ? "0" : "") + num;
            }
            this.monthOptions.push(i);
        }
        currYear = new Date().getFullYear();
        for (i=0;i<=20;i++) {
            this.yearOptions.push(currYear+i);
        } 
    }
    render() {
        return (
            React.createElement("div", {className: "card-info-form"},
                React.createElement("div", {className: "card-info-input-field"},
                    React.createElement("label", null, "Card Number"),
                    React.createElement("input", {
                        type: "text",
                        ref: "card_number",
                    })
                ),
                React.createElement("div", {className: "card-info-input-field"},
                    React.createElement("label", null, "Expire Month"),
                    React.createElement("select", {ref: "expire_month"},
                        this.monthOptions.map(function(mo) {
                            return (
                                React.createElement("option", {value: mo}, mo)
                            )
                        }.bind(this))
                    )
                ),
                React.createElement("div", {className: "card-info-input-field"},
                    React.createElement("label", null, "Expire Month"),
                    React.createElement("select", {ref: "expire_month"},
                        this.yearOptions.map(function(yr) {
                            return (
                                React.createElement("option", {value: yr}, yr)
                            )
                        }.bind(this))
                    )
                ),
                React.createElement("div", {className: "card-info-input-field"},
                    React.createElement("label", null, "CVV2"),
                    React.createElement("input", {
                        type: "text",
                        ref: "cvv2",
                    })
                ),
                React.createElement("div", {className: "card-info-input-field"},
                    React.createElement("label", null, "First Name"),
                    React.createElement("input", {
                        type: "text",
                        ref: "first_name",
                    })
                ),
                React.createElement("div", {className: "card-info-input-field"},
                    React.createElement("label", null, "Last Name"),
                    React.createElement("input", {
                        type: "text",
                        ref: "last_name",
                    })
                )
            )
        )
    }
}