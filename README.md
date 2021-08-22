# TIA: Twilio Integrated (New Relic) Alerts

Simple middleware to take a payload for New Relic Alerts (classic format, not II format) and send an SMS using Twilio Programmable Messaging API.

## Usage

Copy `sample-app.env` to `app.env` configuring your Twilio auth secrets, and adding a Messaging Service SID [quickstart](https://console.twilio.com/us1/develop/sms/try-it-out/send-an-sms?frameUrl=%2Fconsole%2Fsms%2Fgetting-started%2Fbuild%3Fx-target-region%3Dus1)

Install dependencies first, `npm install`

Run locally using `nodemon server.js`. The app is AWS ELB-ready, will check for port config in the process's env vars.

You will need a Twilio account. [Use my referral link here](www.twilio.com/referral/KP6Q1W), and we can both earn credit! 😉

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

### Sample New Relic Payload

Below is the default payload from New Relic Alerts. Configure this in the webhook alert settings. [Documentation here](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/alert-notifications/customize-your-webhook-payload/) explains the attributes.

```json
{
  "metadata": {
    "evaluation_system_source": "Willamette"
  },
  "open_violations_count_critical": 1,
  "closed_violations_count_critical": 0,
  "incident_acknowledge_url": "https://alerts.newrelic.com/accounts/1147177/incidents/348945230/acknowledge",
  "targets": "[[{\"id\":\"Transaction, TransactionError\",\"name\":\"Transaction, TransactionError query\",\"link\":\"https://insights.newrelic.com/accounts/1147177/query?query=SELECT%20count%28%2A%29%20from%20Transaction%2C%20TransactionError%20where%20request.uri%20like%20%27%25grayspencer%25%27%20TIMESERIES%201%20minute%20SINCE%20%272021-08-22%2005%3A06%3A07%27%20UNTIL%20%272021-08-22%2011%3A05%3A07%27\",\"labels\":{},\"product\":\"NRQL\",\"type\":\"Query\"}]'][0]['name']",
  "duration": 407,
  "open_violations_count_warning": 0,
  "event_type": "INCIDENT",
  "incident_id": 348945230,
  "account_name": "gspncr",
  "details": "Transaction, TransactionError query result is > 2.0 on 'Gray Spencer Visits'",
  "condition_name": "Gray Spencer Errors",
  "timestamp": 1629630307446,
  "owner": "",
  "severity": "CRITICAL",
  "policy_url": "https://alerts.newrelic.com/accounts/1147177/policies/515685",
  "current_state": "open",
  "policy_name": "Test Policy",
  "condition_family_id": 22250835,
  "incident_url": "https://alerts.newrelic.com/accounts/1147177/incidents/348945230",
  "account_id": 1147177,
  "runbook_url": null,
  "violation_chart_url": "https://gorgon.nr-assets.net/image/2af605d6-77c9-4789-ae1b-421a140dda11?config.legend.enabled=false",
  "timestamp_utc_string": "2021-08-22, 11:05 UTC",
  "condition_description": "the owner is : \nowner: 'garyspencer'\nteam: 'gspencerOps'",
  "violation_callback_url": "https://insights.newrelic.com/accounts/1147177/query?query=SELECT%20count%28%2A%29%20from%20Transaction%2C%20TransactionError%20where%20request.uri%20like%20%27%25grayspencer%25%27%20TIMESERIES%201%20minute%20SINCE%20%272021-08-22%2005%3A06%3A07%27%20UNTIL%20%272021-08-22%2011%3A05%3A07%27",
  "closed_violations_count_warning": 0
}
```
