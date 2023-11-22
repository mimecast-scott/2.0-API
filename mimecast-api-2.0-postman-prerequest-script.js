
// This pre-request script will send variables {{2.0mimeid}} and {{2.0mimesecret}} to Mimecast auth API https://api.services.mimecast.com/oauth/token and create a new local variable called {{2.0_access_token}} and {{2.0_expires_in}} - the value of {{2.0_access_token}} should be set under Authorization tab with the dropdown selected on 'Bearer'
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

var getToken = true;

if (!pm.environment.get('2.0_expires_in') ||
    !pm.environment.get('2.0_access_token')) {
    console.log('Mime 2.0 Token or expiry date are missing');
} else if (pm.environment.get('2.0_expires_in') <= (new Date()).getTime()) {
    console.log('Mime 2.0 Token is expired');
} else {
    getToken = false;
    console.log('Mime 2.0 Token and expiry date are all good');
}

if (getToken === true) {
    pm.sendRequest(getAuthToken, function (err, res) {
        console.log(err ? err : res.json());
        if (err === null) {
            console.log('Saving the token and expiry date');
            var responseJson = res.json();
            pm.environment.set('2.0_access_token', responseJson.access_token);

            var expiryDate = new Date();
            expiryDate.setSeconds(expiryDate.getSeconds() + responseJson.expires_in);
            pm.environment.set('2.0_expires_in', expiryDate.getTime());
        }
    });
}
