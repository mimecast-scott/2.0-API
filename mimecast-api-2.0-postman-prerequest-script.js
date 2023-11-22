
// This pre-request script will send variables {{2.0mimeid}} and {{2.0mimesecret}} to Mimecast auth API https://api.services.mimecast.com/oauth/token and create a new local variable called {{2.0_access_token}} and {{2.0_expires_in}} - the value of {{2.0_access_token}} should be set under Authorization tab with the dropdown selected on 'Bearer'
function getNewTokenAndStore(){
    console.log('Mime 2.0 - Requesting new bearer token');
    pm.sendRequest(getAuthToken, function (err, res) {
        console.log(err ? err : res.json());
        if (err === null) {
            console.log('Saving the token to variable');
            var responseJson = res.json();
            pm.environment.set('2.0_access_token', responseJson.access_token);

            var expiryDate = new Date();
            console.log('Saving the token expiry time to variable:' +  responseJson.expires_in);
            expiryDate.setSeconds(expiryDate.getSeconds() + responseJson.expires_in);
            pm.environment.set('2.0_expires_in', expiryDate.getTime());
        }
    });


}

const getAuthToken = {
  url:  'https://api.services.mimecast.com/oauth/token', 
  method: 'POST',
  header: {
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: {
    mode: 'urlencoded',
    urlencoded : [
      { key: 'client_id', value: pm.variables.get("2.0mimeid")},
      { key: 'client_secret', value: pm.variables.get("2.0mimesecret")},
      { key: 'grant_type', value: 'client_credentials'}
    ]
  }
};

var expiryBuffer = 60 // seconds before expiry time that key will be requested from auth api. i.e. don't leave it until its about to expire.

if (!pm.environment.get('2.0_expires_in') ||
    !pm.environment.get('2.0_access_token')) {
    console.log('Mime 2.0 Token or expiry date are missing');
} else if (pm.environment.get('2.0_expires_in') - (expiryBuffer*1000) <= (new Date()).getTime()) {
    console.log('Mime 2.0 Token is expired');
    getNewTokenAndStore() // request new Token and store to postman variables
} else {
    var timeLeft = Math.ceil((pm.environment.get('2.0_expires_in')-(new Date()).getTime())/1000);
    console.log('Mime 2.0 Token and expiry date are all good for:' + timeLeft + ' seconds.');

}

