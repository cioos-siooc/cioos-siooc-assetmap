from flask import Flask, send_from_directory
from requests import get
import json

base_ckan_url = 'http://patate.com/api/'
app = Flask(__name__)

def load_proxy_setting( jsonfilename ):
    with open('./asset/resources/' + jsonfilename) as json_file:
        global base_ckan_url
        data = json.load(json_file)
        print(data)
        base_ckan_url = data['api_url']
        print(base_ckan_url)


@app.route('/')
def hello():
    return 'Go to asset/index.html to see assetmap'


@app.route('/reload/<path:path>')
def relaod_proxy(path):
    print( 'Try to load: ' + path)
    load_proxy_setting(path)
    return 'proxy loaded'

@app.route('/ckan/<path:path>')
def call_ckan(path):
    # call CKAN and send response back
    global base_ckan_url
    url = base_ckan_url + '3/action/' + path
    print ( "Proxy for: " + url )
    return get(url).content

@app.route('/asset/<path:path>')
def send_js(path):
    return send_from_directory('asset', path)

if __name__ == '__main__':
    load_proxy_setting('ckan.json')
    app.run(host='0.0.0.0', debug=True)