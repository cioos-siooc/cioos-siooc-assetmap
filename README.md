# Assetmap starting point

Containt basic html and javascript to be embedded in a HTML page.

This isn't the final project nor the Wordpress plugin.

Use Flask to enable a simple proxy to test CKAN API access and serve file.

# Installation

Tested with python 3.7 on windows 10

* Create virtual environment for the project
    * python -m venv path/to/project/venv
* activate environment
    * path/to/project/venv/Script/activate
* install dependencies
    * pip install -r requirements.txt
* Execute Flask server
    * python main.py
    
# Docker installation

```
­> git clone <project_url>
> cd <root_of_project>
> docker-compose up
```

# Configuration files

## ckan.json
 
Link to the CKAN 

## filters.json

All cetegories, viriables and CKAN search criteria

## ui_str.json

Translation data

# Quick Todo:

* Change current icon for new one ( currently canibalised from Condition Maritime )
* generate ckan dataset/organisation url with language ( if supported )
* create ids with dataset id for detail panel
* on details click, show correct values
* on detail click, scroll to correct panel
* add config for initial map display
    * zoom level
    * extent
    * rectangle color/fill/outset 
    * multiple section vector type ( only rectangle for now ) 
* add CSS for variable label et category label + layout
* add bbox region to search function
* position variable with 3 per row
* generate tab panel per category
* sort rectangle by area size
* translate CKAN description in html ( markdown style)
* hide/show variable panel
* hide/show dataset details
* show the map control and attribution even with panel
* add responsive css
* better error checking
    * Look if dataset has a minimum ( id, titile, etc ) before adding it
* CSS, again and again and again...

#References

[Mockup](https://xd.adobe.com/view/f27999f2-a6d1-4498-51b1-37dc757286ff-8448/screen/6b487dff-190c-45b1-b1ca-478295611337/Web-1920-15/)

#Done
* generate icon with multiple size ( thumbnail )
* look for tag to add variable icon in detail of dataset  ( used keyword/tags with variable ckantext )
* iterate through dataset resources for other view tool links ( simulate tool with PDF, WMS, CSV )
* remove methode reveiving language in parameter and rely only on i18n class
* Docker image for test deployment
* Clean all if no variable selected 
* multiple call to retrieve all data ( paginated, not just first 10)
* json for translation ( fr, en, other?)
* encapsulate translation in a class that know the current langage ( getUISTR, default if not found )
* load config for proxy in ckan.json in python
