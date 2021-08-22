/* 
    1. check the owning team, handle if not listed
    2. check if the alert is open/close
    3. lookup owning teams number
    4. receive the response back from TwilioActions

*/
const TwilioActions = require('./TwilioActions')

var teamStore = require('./teamstore.json');

function checkOwner(payload){
    //const owner = payload;
    for(let i = 0; i < teamStore.length; i++){
        //console.log(teamStore[i].user)
        const regex = teamStore[i].user
        const found = payload.match(regex)
        if(found){
            //console.log(found);
            //console.log("a match");
            //console.log(teamStore[i].countrycode.toString() + teamStore[i].number.toString());
            let number = teamStore[i].countrycode.toString() + teamStore[i].number.toString()
            //TwilioActions.sendSMS(number)
            return (teamStore[i].countrycode.toString() + teamStore[i].number.toString());
        }
    }
}

module.exports = {checkOwner}