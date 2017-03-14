var AVAILABLE_APIS = {
    react: "https://unpkg.com/react@15/dist/react.js",
    reactDom: "https://unpkg.com/react-dom@15/dist/react-dom.js",
    api: "/js/api.js",
    table_config: "/js/table_config.js",
    components_Nav: "/js/react/Nav.js",
}

function loadApis(apis) {
    /*
     * Adds script tags to the head for all the required application Javascript sources
     */
    var head, selectedApis;
    head = document.getElementsByTagName("head")[0];
    selectedApis = Object.keys(AVAILABLE_APIS).filter(function(k) {
        return !apis || apis.length === 0 || apis.indexOf(k) >= 0;
    });
    var promises = selectedApis.map(function(api) {
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
    return Promise.all(promises);
}


function renderApp(node) {
    /*
     * Takes either a DOM node or ID string and builds React application
     */
    if (typeof(node) === "string") node = document.getElementById(node);
    ReactDOM.render(React.createElement(Dashboard, null), node);
}