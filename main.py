from flask import Flask, send_from_directory
from requests import get

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Go to /index.html to see assetmap'


@app.route('/ckan/<path:path>')
def call_ckan(path):
    # call CKAN and send response back
    print('Call CKAN proxy')
    print(path)
    # url = 'https://test-catalogue.ogsl.ca/api/3/action/package_search?' + path
    url = 'http://open.canada.ca/data/api/3/action/package_search?' + path
    return get(url).content

@app.route('/asset/<path:path>')
def send_js(path):
    return send_from_directory('asset', path)

if __name__ == '__main__':
    app.run(debug=True)