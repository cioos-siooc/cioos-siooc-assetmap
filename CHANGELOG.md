# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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
