import requests
import json
import time

AUTH_URL = 'https://api.services.mimecast.com/oauth/token'
API_URL = 'https://api.services.mimecast.com/api/awareness-training/company/get-performance-details'
CLIENT_ID = "<-- YOUR MIMECAST 2.0 API CLIENT ID -->"
CLIENT_SECRET = "<-- YOUR MIMECAST 2.0 API CLIENT SECRET -->"
PAGE_SIZE= 50 # Default page size

def get_bearer_token(auth_url, client_id, client_secret):
    auth_data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'client_credentials'
    }

    auth_response = requests.post(auth_url, data=auth_data)
    auth_response.raise_for_status()

    return auth_response.json()['access_token']

def get_info(api_url, bearer_token, page_token=None,page_size=PAGE_SIZE):
    headers = {
        'Authorization': f'Bearer {bearer_token}',
        
    }

    params = {'meta': {
                        'pagination':{
                                        'pageSize' :page_size
                        }
    }
    }
    if page_token:
        print(page_token,"detected")
        params['meta']['pagination']['pageToken'] = page_token
    params=json.dumps(params)
    response = requests.post(api_url, headers=headers, data=params)
    response.raise_for_status()

    return response.json()

def main(auth_url=AUTH_URL,client_id=CLIENT_ID,client_secret=CLIENT_SECRET,api_url=API_URL):


    # Initial token acquisition
    bearer_token = get_bearer_token(auth_url, client_id, client_secret)
    page_token = None

    while True:
        try:
            # Get information using the current bearer token and page token
            info_data = get_info(api_url, bearer_token, page_token)
            
            # Process the information as needed
            print(info_data)

            # Check for pagination
            if 'next' in info_data['meta']['pagination']:
                page_token = info_data['meta']['pagination']['next']
                print("Pagination detected next page:",page_token)
            else:
                page_token = None
                # If no more pagination, exit the loop
                break

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                # If the token is expired, refresh it
                bearer_token = get_bearer_token(auth_url, client_id, client_secret)
            elif e.response.status_code == 429:
                backOffTime = 60 # default backoff time to handle server side rate limiting
                # Some code to get X-RateLimit-Reset response header and set backOffTime to this value
                time.sleep(backOffTime)
            else:
                # Handle other HTTP errors
                print(f"HTTP Error: {e}")
                break

        except Exception as e:
            # Handle other exceptions
            print(f"Error: {e}")
            break

if __name__ == "__main__":
    main()
