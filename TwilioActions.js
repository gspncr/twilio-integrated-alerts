/* 
    1. notify the owning team (owningTeam, teamNumber)
    2. handle the Twilio response
    3. pass success/error back to NR actions

*/
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
require('dotenv').config({ path: 'app.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingSid = process.env.TWILIO_MESSAGING_SID

const client = require('twilio')(accountSid, authToken, {
    lazyLoading: true
});

async function sendSMS(number, message){
    let recipient = '+' + number
    client.messages 
      .create({ 
         body: message,  
         messagingServiceSid: messagingSid,      
         to: recipient
       }) 
      .then(message => logger.info({message: message})) 
      .done();
}

//console.log('using twilio SID: ' + accountSid);
module.exports = {sendSMS}

const { combine, timestamp, json } = format;
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        json(),
      ),
    defaultMeta: { level: 'info', service: 'tia-twilio-service_TwilioActions' },
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
    ],
  });