# TIA: Twilio Integrated (New Relic) Alerts

Simple middleware to take a payload for New Relic Alerts (classic format, not II format) and send an SMS using Twilio Programmable Messaging API.

## Usage

Copy `sample-app.env` to `app.env` configuring your Twilio auth secrets, and adding a Messaging Service SID [quickstart](https://console.twilio.com/us1/develop/sms/try-it-out/send-an-sms?frameUrl=%2Fconsole%2Fsms%2Fgetting-started%2Fbuild%3Fx-target-region%3Dus1)

Install dependencies first, `npm install`

Run locally using `nodemon server.js`. The app is AWS ELB-ready, will check for port config in the process's env vars.

## How does it work?

The app exposes three endpoints:

1. `/health` which takes a GET request and responds with *healthy* - used by AWS ELB health checks
2. `/newrelicalert` which takes a POST payload from New Relic Alerts
3. `/twiliocallback` which takes a POST payload from Twilio Messaging Service. This component is optional, and logs the status from Twilio's side.

Logs are written to `combined.log` and have no rotation by default.

When receiving at `/newrelicalert` the app checks the payload for that `"current_state": "open"` - if this is anything else, it will return a handled exception.

If the state is open, the app will then check within the New Relic Alert Condition Description a match for any string that is a match against the `user` in `teamstore.json`. This match can be anything from a username to an ID. 

Should there not be a match then a handled exception will be returned explaining that there is no match.

If there is a match, the number and countrycode will be concatinated and used to dispatch an SMS to from Twilio. The body of that message will include the severity, policy name, condition name, and incident URL. 

## Security

Security in this app almost does not exist. If you are to productionise this, ensure the following:
1. Lock this down to a private VPC accepting only inbound [New Relic IP addresses](https://docs.newrelic.com/docs/using-new-relic/cross-product-functions/install-configure/networks/#webhooks), and [Twilio IP addresses](https://support.twilio.com/hc/en-us/articles/115015934048-All-About-Twilio-IP-Addresses) (only necessary if using this as a callback). This also could be built into and handled within Express.
2. Consider using environment variables within ELB over saving through `app.env`
