# Billing Dashboard
## What is this
This is currently very much in progress.  At a time, I had a number of applications that required the handling of invoicing and payment operations, so this was born out of a desire to unify that process with a single platform and oauth connections.

## How it works
The application is built with a node/express/mongo backend and a reactjs frontend.  It is a very simple application for handling the creation of new invoices, passing those invoices onto the client, and for now, connecting with paypal as the primary payment processor.

The application can register other platforms as 'clients' and those clients can have billing pages which they can then use to invoice clients (who would connect with oauth access granted from the client application).

The platform offers feedback mechanisms, so that the client application can be totally removed from billing and invoicing conerns.  By setting rules, this platform can issue callbacks to the client app dictating how service is affected for delinquent accounts.

Included in this repository is the `oauth_server_app`.  This is meant to provide a boiler plate for integration with this app on google's appengine infrastructure.  It can be used as a starting point for making your appengine application an oauth2 identity provider.

## Why
I'm sure similar products exist with a much more extensive support, but I thought this would be fun, and I didn't want to pay for such services.  It's very much a work in progress, no where near ready for deployment, it doesn't even compile yet (I mean, I'm even missing my node_modules and package.json).  If you'd like to help out, message me and we can talk, right now I have no plans for how other people could get involved in this development.
