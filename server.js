require('dotenv').config({ path: 'app.env' });
const express = require('express');
const cors = require('cors');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const app = express();
const NewRelic = require('./NewRelicActions');
const TwilioActions = require('./TwilioActions')

app.use(cors(), express.json())

app.get( '/health', (req, res) => {
    res.send( "healthy" );
  });

app.post('/newrelicalert', (req, res) => {
    let number = NewRelic.checkOwner(req.body['condition_description']);
    let url = req.body['incident_url'];
    let state = req.body['current_state'];
    let severity = req.body['severity'];
    let title = req.body['policy_name'] + ': ' + req.body['condition_name'];

    if (state != 'open'){
        logger.info({message: number + state});
        return res.json({error : true, reason: "incident is != open and i dont care"});
    } else if (number){
        let message = 'New ' + severity + ' incident: ' + title + ' Action at: ' + url
        logger.info({message: number + message + state})
        const sendSms = TwilioActions.sendSMS(number, message);
        logger.info({message: sendSms.status})
        return res.json({telephoneNumber : number});
    }
    logger.info({message: number + req.body['condition_description']})
    res.json({error: true, telephoneNumber : "Number not found in team store"})
});

app.post('/twiliocallback', (req, res) => {
    logger.info({message: req.body})
    return res.json({logged : true})
});

const port = process.env.PORT || 3000

const server = app.listen(port, function() {
    console.log("Server running at http://127.0.0.1:" + port + "/");
  });

const { combine, timestamp, json } = format;
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json(),
      ),
    defaultMeta: { level: 'info', service: 'tia-twilio-service' },
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
