from flask import Flask, send_from_directory
from flask import request
from requests import get
import json
import os.path

base_ckan_url = 'http://patate.com/'
# support multiple configuration of procy setting
# ckan/nome_of_proxy_config/info
base_proxy_config = {}
base_proxy_auth = {}

app = Flask(__name__)

def load_proxy_setting( jsonfilename ):
    """
    Load config and put it in the config
    """
    with open('./asset/resources/' + jsonfilename, 'rt') as json_file:
        global base_ckan_url
        global base_proxy_config
        data = json.load(json_file)
        base_ckan_url = data['api_url']
        print(base_ckan_url)
        base_proxy_config[jsonfilename] = data

def load_auth_config():
    global base_proxy_auth
    base_proxy_auth = {}
    if os.path.isfile('auth.json'):
        with open('auth.json', 'rt') as json_file:
            base_proxy_auth = json.load(json_file)

@app.route('/')
def hello():
    return 'Go to asset/index.html to see assetmap'

@app.route('/robots.txt')
def robot():
    # disallow all crawler
    return """User-agent: *
Disallow: /
"""

@app.route('/reload/<path:path>')
def relaod_proxy(path):
    print( 'Try to load: ' + path)
    load_proxy_setting(path)
    return 'proxy loaded'

@app.route('/ckan/<path:path>')
def call_ckan(path):
    # call CKAN and send response back
    global base_proxy_config
    global base_proxy_auth
    # procy config name
    pathitems = request.path.split('/')
    # default ckan proxy
    proxyconfigname = 'ckan.json'
    if len(pathitems) == 4:
        proxyconfigname = pathitems[2] + '.json'
        # remove ckan proxy name from path
        path = pathitems[3] + request.url[len(request.base_url):]

    if proxyconfigname not in base_proxy_config:
        load_proxy_setting(proxyconfigname)
    config = base_proxy_config[proxyconfigname]
    url = config['api_url'] + '3/action/' + path
    if proxyconfigname in base_proxy_auth:
        print ( "Proxy with auth for: " + url )
        authconf = base_proxy_auth[proxyconfigname]
        # extract username and password
        return get(url, auth=(authconf['username'], authconf['password'])).content
    print ( "Proxy for: " + url )
    return get(url).content

@app.route('/asset/<path:path>')
def send_js(path):
    return send_from_directory('asset', path)

if __name__ == '__main__':
    load_proxy_setting('ckan.json')
    # if file exists, load auth.json. This should be available by installation and not by default
    load_auth_config()
    app.run(host='0.0.0.0')  #, debug=True)
