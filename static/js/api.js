function getOutstandingInvoices(page) {
    var xhr, response;
    return new Promise(function(resolve, reject) {
        xhr = new XMLHttpRequest();
        page = page || 0;
        xhr.open("GET", "/invoice/pending?page=" + page, true);
        xhr.onload = function(e) {
            response = JSON.parse(e.currentTarget.response);
            response.success ? resolve(response.results) : reject();
        }
        xhr.onerror + function(e) {
            console.log(e);
            reject();
        }
        xhr.send();
    });
}


function getPastInvoices(page) {
    var xhr, response;
    return new Promise(function(resolve, reject) {
        xhr = new XMLHttpRequest();
        page = page || 0;
        xhr.open("GET", "/invoice/past?page=" + page, true);
        xhr.onload = function(e) {
            response = JSON.parse(e.currentTarget.response);
            response.success ? resolve(response.results) : reject();
        }
        xhr.onerror = function(e) {
            console.log(e);
            reject();
        }
        xhr.send();
    });
}
