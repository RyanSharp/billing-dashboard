var CORE_APIS = {
    react: "https://unpkg.com/react@15/dist/react.js",
    reactDom: "https://unpkg.com/react-dom@15/dist/react-dom.js",
}

var AVAILABLE_APIS = {
    api: "/js/api.js",
    table_config: "/js/table_config.js",
    components_Nav: "/js/react/Nav.js",
}

function loadApis() {
    return new Promise(function(resolve, reject) {
        var promises = Object.keys(CORE_APIS).map(function(api) {
            return new Promise(function(resolve, reject) {
                if (CORE_APIS[api]) {
                    var scriptTag;
                    scriptTag = document.createElement("script");
                    scriptTag.setAttribute("src", CORE_APIS[api]);
                    scriptTag.setAttribute("type", "text/javascript");
                    scriptTag.onload = resolve;
                    scriptTag.onerror = reject;
                    scriptTag.onreadystatechange = function(e) {
                        if (this.readyState === "complete") resolve();
                    }
                    head.appendChild(scriptTag);
                } else {
                    reject();
                }
            });
        });
        Promise.all(promises).then(function{
            var promises = Object.keys(AVAILABLE_APIS).map(function(api) {
                return new Promise(function(resolve, reject) {
                    if (AVAILABLE_APIS[api]) {
                        var scriptTag;
                        scriptTag = document.createElement("script");
                        scriptTag.setAttribute("src", AVAILABLE_APIS[api]);
                        scriptTag.setAttribute("type", "text/javascript");
                        scriptTag.onload = resolve;
                        scriptTag.onerror = reject;
                        scriptTag.onreadystatechange = function(e) {
                            if (this.readyState === "complete") resolve();
                        }
                        head.appendChild(scriptTag);
                    } else {
                        reject();
                    }
                });
            });
            Promise.all(promises).then(function(resolve));
        });
    });
}


function renderApp(node) {
    /*
     * Takes either a DOM node or ID string and builds React application
     */
    if (typeof(node) === "string") node = document.getElementById(node);
    ReactDOM.render(React.createElement(Dashboard, null), node);
}