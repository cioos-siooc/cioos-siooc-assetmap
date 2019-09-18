# Quick Todo:

* Create details panel with cache or call when "detail" button click 
* Add dataset details in cache when restrict_json_return set to false
* implement cluster mouse over / clic
* Add basic auth support in API call ( debug )
    * define in config
    * require user info 
* Add option for EOV support in CKAN config
* Define tool support configuration
    * define resource identification
    * define i18n label / icon
* better code documentation
* Change current icon for new one ( currently canibalised from Condition Maritime )
* bettter ids for dataset panel ( limit conflict with crm )
* on detail click, scroll to correct panel
* add CSS for variable label et category label + layout
* position variable with 3 per row
* sort rectangle by area size
* transform CKAN description in html ( markdown style)
* hide/show variable panel drawer
* hide/show dataset details drawer
* show the map control and attribution even with open panel
* add responsive css
* better error checking
    * Look if dataset has a minimum ( id, title, etc ) before adding it
* CSS, again and again and again...

# Done

* separate details panel creation with basic / complete info
    * update complete info with separate call to CKAN with resource
* Verify support_multilanguage to disable multilingual support parsing
* Test runtime ckan switch
    * add route to proxy to reload other config
* Runtime language switch
* Added JSONP support to query directly CKAN API
* Better handling of pagination with possibility to stop during loading.
* Multiple variable selection should restrict not open up search ( and vs or with + for now )
* generate ckan dataset/organisation url with language ( flag in config, false as default )
* generate tab panel per category
* ON detail panel click "Map", select dataset on the map
* add bbox region to search function
    * only in ckan config for now
    * write search url wih bbox as filter
* config file documentation
* transfrom center view to use WGS84 lat/long in config
* on details click, open dataset details 
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
* add config for initial map display
    * zoom level
    * extent
    * rectangle color/fill/outset 
    * multiple section vector type ( only rectangle for now ) 
