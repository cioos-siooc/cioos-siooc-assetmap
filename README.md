# Assetmap starting point

Containt basic html and javascript to be embedded in a HTML page.

This isn't the final project nor the Wordpress plugin.

Uses a node based CORS proxy

## Installation

 - Install [NodeJS](https://nodejs.org/en/download/)
 - `cd` to this directory
 - `npm install`
    
## Running (Development)
 - Start the CORS proxy if required, `node corsproxy.js`. This is for development only
 - In a separate terminal, `npm start`, this will start the development server which will
   webpack your JS when you save as well as reload the page.

## Running (Production)
 - See `index.html` for an example
 - You will need to include the folders `css`,`dist`,`images`, and `resources`
 - If you make changes, run `npm run build` to generate a new `dist/bundle.js`

## CORS Proxy
 - If you are using the CORS proxy, setup `proxy_url` as so:
    - `"proxy_url":"http://localhost:8080",`

## Configuration files

## ckan.json
 
Link to the CKAN instance:

* proxy_url : URL of CORS proxy server, eg, `http://localhost:8080`
* base_url : Homepage of the CKAN instance to redirect user to.
* api_url : API URL to access the desired CKAN instance. This is use by the proxy server.
* dataset_url : url to follow to direct a user to the dataset page of the ckan instance.
* organization_url : url to follow to direct a user to the organization page of the ckan instance.
* add_language_url : Boolean to enable the desired language to be displayed by CKAN. The language code is added after url be before the id.
* start_bbox: Initial bounding box to restrict search to.
* page_size: Maximum number of dataset returned per call the to API.
* restrict_json_return: Use "fl" in the package search call to limit the item serialized per dataset. Only supported in the latest version of CKAN and require special consideration with Solr configurations.
* support_time: Can use minimum and maximum time interval in search criteria (in development)
* support_vertical: Can use minimum and maximum vertical (depth) in search criteria (in development)
* support_eov: Add variable search criteria in eov tag and look in eov for vraible ifentifier (in development)
* use_basic_auth: Add http basic authoization to the query (in debug, might be remove)

Example of the configuration to use open.canada.ca catalog
```
{
    "base_url":"http://open.canada.ca/",
    "dataset_url": "http://open.canada.ca/data/",
    "organization_url": "http://open.canada.ca/data/",
    "access_url":"/ckan/",
    "add_language_url": true,
    "start_bbox": [-118, 36, -40, 63],
    "page_size": 40,
    "restrict_json_return": false,
    "support_time": false,
    "support_vertical": false,
    "support_eov": false,
    "use_basic_auth": false
}
```

## filters.json

All categories, variables and CKAN search criteria.

Categories contains a list of variable. Either element has the transalted lable, icon and if the item is enabled or not. Each category is reprensented by a clickable icon at the top left corner. All the variables of a category are grouped inside a panel. This panel is shown when the category icon is clicked. 

```
{
    categories: [{
        "id": "physic",
        "label":
        {
            "fr": "PHYSIQUE",
            "en": "PHYSICS"
        },
        "icon": "physics.png",
        "enabled": true,
        "variables":[{}]
    }]
}

```

Each variable defines the text used in the ckan package seach. This is a temporary solution until the search criteria and schema definition is established. The same "ckantext" is used to map the variable to a dataset via the tag/keyword. This is still a temporary solution. The translation of the search term might be necessary if no tranlsation in the ckan dataset is available. The icon files are in /images directory and the thumbnail in /images/thumbnails directory. As of now, no translation for the icon is planned.

```
    "variables":[{
        "id": "var_salinity",
        "icon":"seaWaterSalinity.png",
        "label":
        {
            "fr":"Salinité",
            "en":"Salinity"
        },
        "ckantext":["salinity"],
        "eov":["salinity"],
        "enabled": true
    }]
```

## map.json

Display style and initial map attributes.

start-view is mapped to the ol.view use by the openlayer map. the center element is in WGS84( ESPG:4326 ) and transform to the correct map projection system during creation.
```
"start_view": {
        "zoom": 4,
        "minZoom": 2,
        "center": [-68, 48]
    }
```

The Polystyle is used for the display of rectangular extent. Stroke is used for the outer rectangle region and Fill is for the rectangle interior. Those element are use as is in the vector layor style creation. Other item can be added is supported by openlayer. 
```
"Polystyle":{
        "Stroke":{
            "color": "blue",
            "lineDash": [4],
            "width": 3
        },
        "Fill":{
            "color": "rgba(0, 0, 255, 0.1)"
        }
    }
```
Back layer configuration still to implement. Use OpenStreetMap for now.

Some information for the basic icon clustering style are define in the "icon_cluster" object. The distance between point, radius and colors of the circle are available.

```
"icon_cluster": {
    "distance": 40,
    "minimum":{
        "cluster_value": 5,
        "circle_radius": 10,
        "text_color": "#fff",
        "fill_color": "#3399CC",
        "stroke_color": "#fff"
    },
    "maximum":{
        "cluster_value": 25,
        "circle_radius": 20,
        "text_color": "#fff",
        "fill_color": "#3399CC",
        "stroke_color": "#fff"
    }
}
```

### background layer

Three type of background layer are available: OpenStreetMap, Bing map and custom WMS

OpenStreetMap

```
{
    "name": "osm",
    "type": "OpenStreetMap"
    "attribution"{
        "fr": "",
        "en": ""
    },
    "label": {
        "fr": "",
        "en": ""
    }
}
```

Bing Maps

```
{
    "name": "bing",
    "type":  "Bing",
    "key": "",
    "imagerySet": ""
    "attribution"{
        "fr": "",
        "en": ""
    },
    "label": {
        "fr": "",
        "en": ""
    }
}
```

Custom WMS

```
{
    "name": "name_of_map",
    "type": "wms",
    "server_url": "https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv?",
    "layer_name": "gebco_latest",
    "serverType": "geoserver",
    "version": "",
    "style": "",
    "parameters": ""
    "attribution"{
        "fr": "",
        "en": ""
    },
    "label": {
        "fr": "",
        "en": ""
    }
}
```



## ui_str.json

Translation strings.

List of strings defined by an name and the different version per language supported. 
```
"dataset_title": {
    "fr": "Titre du jeu de données",
    "en": "Dataset title"
  }
```

The class StringTranslator use this configuration and has method to retrieve the correct string for a specified language, the one set as current or the default language. 

# CKAN Schema and API dependencies


## search API

THE CKAN API action "package_search" is used to list all dataset, in a paginated manner. The bounding box, text and some other filters can be used as search criterias.

## variables 

Variables needs to be clearly identified in the CKAN schema. The asset map could agregate more than one specific variable under the same name and use to configuration to regroup them. For example, there is "temperature" as a selectable variable but there can be "surface water temperature", "air temperature", "underwater temperature" as variable type constant coming from the metadata file and listed as a tag in the CKAN schema. The "temperature" variabe selection would encompass all of them. 

## tools

The interface need to show the user a link to the available tools to display, manipulate or download the specific dataset. Ther need to be a way to identified or compute the link based on the information in the CKAN schema. This could be as resources to the dataset or specific item. Fo example, if the dataset in accessible via ERDAPP, the url need to be available or the base ERDDAP url availbale in a configuration and using the id or other info, retwrite the URL. 

# References

[Mockup](https://xd.adobe.com/view/f27999f2-a6d1-4498-51b1-37dc757286ff-8448/screen/6b487dff-190c-45b1-b1ca-478295611337/Web-1920-15/)

