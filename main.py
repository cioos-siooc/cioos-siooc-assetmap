from flask import Flask, send_from_directory
from requests import get
import json

base_ckan_url = 'http://open.canada.ca/data/api/'
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Go to /index.html to see assetmap'


@app.route('/ckan/<path:path>')
def call_ckan(path):
    # call CKAN and send response back
    url = base_ckan_url + '3/action/package_search?' + path
    return get(url).content

@app.route('/asset/<path:path>')
def send_js(path):
    return send_from_directory('asset', path)

if __name__ == '__main__':
    with open('./asset/resources/ckan.json') as json_file:
        data = json.load(json_file)
        print(data)
        base_ckan_url = data['api_url']
        print(base_ckan_url)
    app.run(host='0.0.0.0', debug=True)