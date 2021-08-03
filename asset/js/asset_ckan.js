
import * as ol from "ol"
import * as geom from 'ol/geom';
import * as source from 'ol/source';

import jQuery from "jquery";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/collapse';

import {centerFeatureOnMap, selectFeatureOnMap, addGeometryToCache, clusterVectorSource, vectorLayer, clusterLayer, useClustering, showInGeometryLayer} from "./asset_ol"

import i18nStrings from "./asset_i18n"

import {ckan_server} from "./asset_entry"

window.jQuery = jQuery;
window.showDatasetDetailDescription=showDatasetDetailDescription;
window.showInGeometryLayer=showInGeometryLayer;


// find where to get ckan_server
const removeTrailingSlash=str=>str ? str.replace(/\/$/, "") : "";

function CKANServer(config)
{
    this.varriables = [];
    this.datasetDetails = {};    // current language to display dataset and UI
    this.currentLanguage = config["language"] || "fr";
    this.backgrouns_layers = config["background_layer"] || "bathy";

    // add current language code in the linked URL to dataset/resource/organization
    // so CKAN display the data ine the desired language
    this.add_language_url = false;

    // The server support translated elements
    this.support_multilanguage = false;

    this.support_eov = false;

    // bounding box where datatset need to intersect with
    this.bbox = undefined;
    // custom bounding box for search
    this.spatialSearch = {
        customBbox: false,
        bbox: []
    };

    // Support filter usin min / mac time
    this.time_minimum = undefined;
    this.time_maximum = undefined;

    this.support_vertical = false;
    this.vertical_minimum = undefined;
    this.vertical_maximum = undefined;

    // index of the last item receive by paging ( next page start here)
    this.lastPagedDataIndex = 0;

    // sequential increment each time filters are modified
    this.lastFilterChange = 0;

    // paging done for filters modified, if differ than lastFilterChange, then not
    // in sych with current filters
    this.currentFilterQuery = 0;

    // result per paging 
    this.resultPageSize = 20;
    
    // rapid paging of data until x dataset receive then change for update before paging 
    this.slowDownPagingTreshold = 300;

    // basic auth support
    this.use_basic_auth = config["use_basic_auth"];
    this.basic_auth_user = config["basic_userd"];
    this.basic_auth_password = config["basic_passd"];

    this.imagesDir = config['images_path'] || 'images';

    this.url=removeTrailingSlash(config["api_url"])+'/3/action/';

    if(config['proxy_url']){
        this.url=removeTrailingSlash(config['proxy_url'])+'/'+this.url
    }

    this.homeUrl = config["base_url"];
    this.dataset_url = config["dataset_url"];
    this.organization_url = config["organization_url"];

    // add current language code in the linked URL to dataset/resource/organization
    // so CKAN display the data ine the desired language
    this.add_language_url = config["add_language_url"];

    // The server support translated elements
    this.support_multilanguage = config["support_multilanguage"];

    // result per paging
    this.resultPageSize = config["page_size"];

    // size of the first call ( smaller let the total of dataset be known quickly)
    this.initialPageSize = config["initial_page_size"] || 5;

    // use fl in the query to limit the number of element return un the JSON
    this.restrict_json_return = config["restrict_json_return"];

    // use eov tag for the search and not q= only
    this.support_eov = config["support_eov"] || false;
    this.use_basic_auth = config["use_basic_auth"] || false;

    // Support filter in the vertical dimension. ex: min -100 max - 25
    this.support_vertical = config["support_vertical"];;

    // Support filter usin min / mac time
    this.support_time = config["support_time"] || false;
    this.support_location = false;
    if ( config["start_bbox"] !== undefined )
    {
        this.support_location = config["support_location"];
    }
    if ( config["start_bbox"] !== undefined )
    {
        if ( config["start_bbox"].length == 4 )
        {
            this.bbox = config["start_bbox"]
        }
    }
    this.getHomeCatalogURL = function() {
        let ret = this.homeUrl;
        if (this.add_language_url)
        {
            ret += this.currentLanguage;
        }
        return ret;
    };

    this.getURLForDataset = function( datasetId ) {
        let ret = this.dataset_url
        if (this.add_language_url)
        {
            ret += this.currentLanguage + '/';
        }
        ret += 'dataset/' + datasetId;
        return ret;
    };

    this.getURLForResources = function( datasetId ) {
        let ret = this.dataset_url
        if (this.add_language_url)
        {
            ret += this.currentLanguage + '/';
        }
        ret +='dataset/' + datasetId;
        return ret;
    };

    this.getURLForOrganization = function( organisationId ) {
        let ret = this.organization_url
        if (this.add_language_url)
        {
            ret += this.currentLanguage + '/';
        }
        ret += 'organization/' + organisationId;
        return ret;
    };

    this.setCustomBbox = function(bbox) {
        this.spatialSearch = {
          customBbox: true,
          bbox: bbox
        };
      };

    this.setCurrentLanguage = function(language) {
        this.currentLanguage = language;
    };

    // add bbounding box filter
    // add pagination

    this.getURLParamForTimeFilter = function()
    {
        //  ?fq=temporal-extent-range:[yyyy-mm-ddThh:mm:ss.sss TO yyyy-mm-ddThh:mm:ss.sss]
        // * = now [2015 TO *]  = 2015 TO NOW
        let ret =  [];
        if ( this.minDate !== undefined || this.maxDate !== undefined)
        {
            let ret_str = "temporal-extent-range:[";
            if ( this.minDate !== undefined )
            {
                ret_str += this.minDate;
            }
            ret_str += " TO ";
            if ( this.maxDate !== undefined )
            {
                ret_str += this.minDate;
            }
            else
            {
                ret_str += "*";
            }
            ret_str += "]";
            ret.push(ret_str);
        }
        // add
        return ret;
    }

    this.getURLParamForVerticalFilter = function()
    {
        // fq=vertical-extent-min:[* TO -25]  +vertical-extent-max:[-5 TO *]
        let ret = [];
        if ( this.vertical_minimum !== undefined)
        {
            ret.push( "vertical-extent-min:[* TO " + this.vertical_minimum + "]");
        }
        if ( this.vertical_maximum !== undefined)
        {
            ret.push( "vertical-extent-max:[" + this.vertical_maximum + " TO *]");
        }
        return ret;
    }

    this.getURLParamterForFieldRestriction = function()
    {
        // fl=title_translated,notes_translated,eov,keywords,spatial
        let ret = "fl=id,title_translated,eov,spatial";
        return ret;
    }

    this.addVariableToURLFilter = function( variable )
    {
        let ret = variable["ckantext"].join();
        return ret;
    }

    this.getVariableEOVFilters = function( variable )
    {
        // will there be any other processing required?
        let ret = [];
        variable['eovs'].forEach( function(element) {
            ret.push(element);
            }
        )
        return ret;
    }

    this.getVariableEOVForQuery = function(variable)
    {
        return variable["ckantext"];
    }

    this.getDatasetShowURL = function( id )
    {
        return `${this.url}/package_show?id=${id}`
    }

    this.getURLParameterForBoundingBox = function (custom) {
    if (! custom) {
        let ret = "ext_bbox="; // -104,17,-18,63
        ret += this.bbox[0].toString() + "," + this.bbox[1].toString() + "," + this.bbox[2].toString() + "," + this.bbox[3].toString();
        return ret;
    } else {
        let ret = "ext_bbox="; // -104,17,-18,63
        ret += this.spatialSearch.bbox[0].toString() + "," + this.spatialSearch.bbox[1].toString() + "," + this.spatialSearch.bbox[2].toString() + "," + this.spatialSearch.bbox[3].toString();
        return ret;
    }
}


    this.getURLPaginated = function( startrow, numrow )
    {
        let ret_url =  this.url;
        let query_elems = [];
        let filtered_query_elems = [];
        let eovs_query = [];

        ret_url += 'package_search?';
        if ( this.support_location )
        {
            if (this.spatialSearch.customBbox) {
                ret_url += this.getURLParameterForBoundingBox(true) + "&";
            } else if (this.bbox !== undefined) {
                ret_url += this.getURLParameterForBoundingBox(false) + "&";
            }
        }
        else if ( this.bbox !== undefined )
        {
            // should check if a bbox exist
            ret_url += this.getURLParameterForBoundingBox(false) + "&";
        }
        if ( this.restrict_json_return )
        {
            // add fl with desired element to be returned in the JSON
            // this feature required the latest version of CKAN and that the items desired are
            ret_url += this.getURLParamterForFieldRestriction() + "&";
        }

        let v=0;
        while( v < this.varriables.length)
        {
            // get element for variable
            let varData = this.varriables[v];
            let varItem = document.getElementById(varData["id"]);
            // if checked, add text to the filter
            if ( varItem.checked )
            {
                if ( this.support_eov )
                {
                    eovs_query = eovs_query.concat(this.getVariableEOVFilters(varData));
                }
                else
                {
                    query_elems = query_elems.concat(this.getVariableEOVForQuery(varData))
                }
            }
            ++v;
        }
        if(eovs_query.length)
            filtered_query_elems.push('eov:(' + eovs_query.join(' OR ') + ')');

        if ( this.support_time )
        {
            filtered_query_elems = filtered_query_elems.concat(this.getURLParamForTimeFilter());
        }
        if ( this.support_vertical )
        {
            filtered_query_elems = filtered_query_elems.concat(this.getURLParamForVerticalFilter());
        }
        // generate q and fq url parameter
        let hasquery = false;
        if ( query_elems.length )
        {
            ret_url += 'q=text:("' + query_elems.join( '" OR "' ) + '")';
            hasquery = true;
        }
        if ( filtered_query_elems.length > 0)
        {
            if (hasquery)
            {
                ret_url += "&";
            }
            ret_url += "fq=" + filtered_query_elems.join( ' +' );
        }

        if ( numrow !== undefined )
        {
            ret_url += '&rows=' + numrow.toString();
        }
        if ( startrow !== undefined )
        {
            ret_url += '&start=' + startrow.toString();
        }

        // bbox
        console.log(ret_url);
        return ret_url;
    };

    this.hasActiveFilter = function () {
        let v=0;
        let ret = false;
        while( v < this.varriables.length)
        {
            // get element for variable
            let varData = this.varriables[v];
            let varItem = document.getElementById(varData["id"]);
            // if checked, add text to the filter
            if ( varItem.checked )
            {
                ret = true;
            }
            ++v;
        }

        if (!ret) {
            if (this.spatialSearch.customBbox) {
              ret = true;
            }
        }
        return ret;
    };

    this.addVariable = function ( variableName ) {
        // should be a dictionnary and don't add multiple time
        this.varriables.push(variableName);
    };

    this.clearVariables = function ()
    {
        this.varriables = [];
    };


    this.getVaraibleIcon = function (name)
    {
        //look for viable of name
        let ret_thumb = undefined;
        return ret_thumb;
    };

    this.getVariableThumbnail = function(name)
    {
        let ret = undefined;
        this.varriables.forEach( function(v)
        {
            if (v["ckantext"] == name)
            {
                ret = v["icon"]
            }
        });
        return ret;
    };

    this.getVariableForEOV = function(name)
    {
        let ret = undefined;
        this.varriables.forEach( function(v)
        {
            // unsuported in IE11
            //if  ( v["eovs"].includes(name) )
            if ( name.indexOf(v["eovs"]) != -1 )
            {
                ret = v;
            }
        });
        return ret;
    }

    this.changeLanguage = function ( newlanguage )
    {
        // clear
        this.currentLanguage = newlanguage;
    }

    this.setBasicAuthInfo = function( username, password)
    {
        this.basic_auth_user = username;
        this.basic_auth_password = password;
    }
}

function addCKANExtent(data)
{
    // add extent to the one already available

}


function getCentroidOfSpatial(spatialobj){
    let center = [0, 0];
    if ( spatialobj["type"] == "Point" )
    {
        center = spatialobj["coordinates"];
    }
    else if ( spatialobj["type"] == "Polygon" )
    {
        center = getCenterOfCoordinates(spatialobj["coordinates"][0]);
    }
    return center;
}

// adapted from https://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript
// takes a 2D array of coordinates
function getCenterOfCoordinates(pts) {
    // one point
    if (pts.length == 1) return pts[0];

    // a line
    if (pts.length == 2)
        return [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2];

    var first = pts[0],
        last = pts[pts.length - 1];
    if (first[0] != last[0] || first[1] != last[1]) pts.push(first);
    var twicearea = 0,
        x = 0,
        y = 0,
        nPts = pts.length,
        p1,
        p2,
        f;
    for (var i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i];
        p2 = pts[j];
        f =
        (p1[1] - first[1]) * (p2[0] - first[0]) -
        (p2[1] - first[1]) * (p1[0] - first[0]);
        twicearea += f;
        x += (p1[0] + p2[0] - 2 * first[0]) * f;
        y += (p1[1] + p2[1] - 2 * first[1]) * f;
    }
    f = twicearea * 3;
    var center = [x / f + first[0], y / f + first[1]];

    return center;
 }

function AddDisplayCKANExtent( data )
{
     // for each, look for the spatial extra
     var i = 0;
     var results = data['result']['results'];
     // list of feature
     var features = [];
     while ( i < results.length )
    {
        var r = results[i];
        var objspatial = undefined;
        // open data canada spatial schema
        if (r["spatial"] != undefined && r["spatial"] !== "")
        {
            //console.log(r["spatial"]);
            objspatial = JSON.parse(r["spatial"]);
        }
        else if ( r['extras'] != undefined)
        {
            // slgo + extension spatial schema
            r['extras'].forEach( function(entry)
            {
                if ( entry['key'] == 'spatial')
                {
                    objspatial = JSON.parse(entry['value']);
                }
            });
        }
        if ( objspatial != undefined )
        {
            // Create geometry feature as polygone (rect extent)
            addGeometryToCache(r['id'], objspatial);
            var feature = new ol.Feature({

                geometry: new geom.Polygon(objspatial['coordinates'])
            });
            feature.setId(r['id']);
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            feature.set('id', r['id']);
             // if multi polygone, will only see first. base on rectangle for now
            feature.set('center', getCentroidOfSpatial(objspatial));
            features.push(feature);
        }
        ++i;
    }
    // recreate layer

    //console.log(vectorLayer);
    let cursource = vectorLayer.getSource();
    cursource.addFeatures(features);
    // update map
}

function AddDisplayCKANClusterIcon( data )
{
    // for each, look for the spatial extra
    var i = 0;
    var results = data['result']['results'];
    // list of feature
    var features = [];
    while ( i < results.length )
   {
       var r = results[i];
       var objspatial = undefined;
       // open data canada spatial schema
       if (r["spatial"] != undefined && r["spatial"] !== "")
       {
           //console.log(r["spatial"]);
           objspatial = JSON.parse(r["spatial"]);
       }
       else if ( r['extras'] != undefined)
       {
           // slgo + extension spatial schema
           r['extras'].forEach( function(entry)
           {
               if ( entry['key'] == 'spatial')
               {
                   objspatial = JSON.parse(entry['value']);
               }
           });
       }
       if ( objspatial != undefined )
       {
            addGeometryToCache(r['id'], objspatial);
           // Create geometry feature as polygone (rect extent)
           let centerPoint;

           centerPoint = getCentroidOfSpatial(objspatial);
           /* if(objspatial['type']==='Point') {
               centerPoint = objspatial['coordinates'];
            }
           else {
               centerPoint = getCentroidOfSpatial(objspatial['coordinates'][0]);
            } */

            const feature = new ol.Feature({
                geometry: new geom.Point(centerPoint)
            });
            feature.setId(r['id']);
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            feature.set('id', r['id']);
            // if multi polygone, will only see first. base on rectangle for now
            features.push(feature);
       }
       ++i;
   }
   // recreate layer

   //console.log(vectorLayer);
   //cursource = clusterLayer.getSource();
   clusterVectorSource.addFeatures(features);
   // update map
}

function getDatasetSpatialData(data)
{   let spatial;
    if (data["spatial"])
{
        spatial = data["spatial"];
    }
    else if ( data['extras'] )
    {
        // slgo + extension spatial schema
        data['extras'].forEach( function(entry)
        {
            if ( entry['key'] == 'spatial')
            {
                spatial = entry['value'];
            }
        });
    }
    if(spatial) return JSON.parse(spatial);
    return false;
}

function displayCKANExtent( data )
{
    // for each, look for the spatial extra
    var i = 0;
    var results = data['result']['results'];
    // list of feature
    var features = [];
    var iconfeatures = [];
    while ( i < results.length )
    {
        var r = results[i];
        var objspatial = undefined;
        // open data canada spatial schema
        if (r["spatial"] != undefined && r["spatial"] !== "")
        {
            objspatial = JSON.parse(r["spatial"]);
        }
        else if ( r['extras'] != undefined)
        {
            // slgo + extension spatial schema
            r['extras'].forEach( function(entry)
            {
                if ( entry['key'] == 'spatial')
                {
                    objspatial = JSON.parse(entry['value']);
                }
            });
        }
        if ( objspatial != undefined )
        {
            addGeometryToCache(r['id'], objspatial);
            // Create geometry feature as polygone (rect extent)
            var feature = new ol.Feature({
                geometry: new geom.Polygon(objspatial['coordinates'])
            });
            feature.setId(r['id']);
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            feature.set('id', r['id']);
            // if multi polygone, will only see first. base on rectangle for now
            feature.set('center', getCentroidOfSpatial(objspatial['coordinates'][0]));
            features.push(feature);
        }
        ++i;
    }
    // recreate layer
    let vectorSource= new source.Vector({
        features: features
    });
    vectorSource.clear();
    vectorSource.addFeatures(features);
    vectorLayer.setVisible(true);
    // update map
}

function textColorToRGBA(color)
{
    let ret = [0, 0, 0, 0];
    var result;
    // detect color type
    if ( color[0] == '#')
    {
        if ( color.length == 4)
        {
            result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(color);
            ret = [ parseInt(result[1], 16) * 16, parseInt(result[2], 16) * 16, parseInt(result[3], 16) * 16, 255.0];
        }
        else if ( color.length == 7)
        {
            result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
            ret = [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255.0];
        }
        else if ( color.length == 9)
        {
            result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
            ret = [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)];
        }
    }
    else if ( color.startsWith('rgb('))
    {
        // extract 3 numbers between the ( ) seprated by ,
        result = /^rgb\(?([d]{3})([d]{3})([d]{3})$/i.exec(color);
        ret = [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255.0];
    }
    else if ( color.startsWith('rgba('))
    {
        // extract 4 numbers between the ( ) seprated by ,
        result = /^rgb\(?([d]{3})([d]{3})([d]{3})([d]{3})$/i.exec(color);
        ret = [ parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), parseInt(result[4], 16)];
    }
    // hex only 3 letter ( rgb )
    // hex 6 letter ( rgb )
    // hex 8 letter ( rgba )
    // rgb function
    // rgba function
    return ret;
}

function lerpColor( color1, color2, lerpvalue)
{
    // lerp should be between 0 and 1.
    // color as a
    // 0 = only color1
    // 1 = only color2
    // the result should be clamp between 0 and 255
    let col1mult = 1 - lerpvalue;
    let ret = [ Math.round((color1[0] * col1mult) + (color2[0] * lerpvalue)),
    Math.round((color1[1] * col1mult) + (color2[1] * lerpvalue)),
    Math.round((color1[2] * col1mult) + (color2[2] * lerpvalue)),
    Math.round((color1[3] * col1mult) + (color2[3] * lerpvalue)) ];
    return ret;
}

function rgbaColorToHexRGB( color )
{
    return "#" + ( (1 << 24)  + (color[0] << 16) + (color[1] << 8) + color[2] ).toString(16).slice(1);
}

function getStyleFromClusterConfig( config, nbrElem)
{
    let ret = {};

    let minweight = 0;
    let maxweight = 1;
    if ( nbrElem <= config['minimum']['cluster_value'] )
    {
        minweight = 1;
        maxweight = 0;
    }
    else if ( nbrElem >= config['maximum']['cluster_value'] )
    {
        minweight = 0;
        maxweight = 1;
    }
    else
    {
        let weigth = (nbrElem - config['minimum']['cluster_value']) / (config['maximum']['cluster_value'] - config['minimum']['cluster_value']);
        maxweight = weigth;
        minweight = 1 - maxweight;
    }
    config['minimum']['circle_radius'] * minweight + config['minimum']['circle_radius'] * maxweight;

    ret['text_color'] = rgbaColorToHexRGB(lerpColor(textColorToRGBA(config['minimum']['text_color']), textColorToRGBA(config['maximum']['text_color']), maxweight));
    ret['fill_color'] = rgbaColorToHexRGB(lerpColor(textColorToRGBA(config['minimum']['fill_color']), textColorToRGBA(config['maximum']['fill_color']), maxweight));
    ret['stroke_color'] = rgbaColorToHexRGB(lerpColor(textColorToRGBA(config['minimum']['stroke_color']), textColorToRGBA(config['maximum']['stroke_color']), maxweight));
    ret['circle_radius'] = config['minimum']['circle_radius'] * minweight + config['maximum']['circle_radius'] * maxweight;
    return ret;
}
// if newCoords exists in existingCoordsArray, return a coordinate that is slightly different
function moveCoordsSlightlyIfDuplicate(newCoords, existingCoordsArray) {
                    
    let lat = newCoords[0];
    let long = newCoords[1];

    let numberMatchingCoords = existingCoordsArray.filter(function (coord) { return coord[0] == lat && coord[1] == long; }).length
    
    if (numberMatchingCoords > 0) {
        let movedCoords = [lat, long + numberMatchingCoords * 0.001]
        return movedCoords;
    }
    return newCoords;
}

function displayCKANClusterIcon( data )
{
    let allCoords = [];
    // for each, look for the spatial extra
    let i = 0;
    let results = data['result']['results'];
    // list of feature
    let features = [];
    while ( i < results.length )
    {
        var r = results[i];
        var objspatial = undefined;
        // open data canada spatial schema
        if (r["spatial"] != undefined && r["spatial"] !== "")
        {
            objspatial = JSON.parse(r["spatial"]);
        }
        else if ( r['extras'] != undefined)
        {
            // slgo + extension spatial schema
            r['extras'].forEach( function(entry)
            {
                if ( entry['key'] == 'spatial')
                {
                    objspatial = JSON.parse(entry['value']);
                }
            });
        }
        if ( objspatial != undefined )
        {
            addGeometryToCache(r['id'], objspatial);
            // Create geometry feature as polygone (rect extent)
            //new Feature(new Point(coordinates));
            let coordsToAdd = getCentroidOfSpatial(objspatial)
            var pointfeature = new ol.Feature({
                
                geometry: new geom.Point(moveCoordsSlightlyIfDuplicate(coordsToAdd, allCoords))
            });
            allCoords.push(coordsToAdd)
            pointfeature.setId(r['id']);
            pointfeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            pointfeature.set('id', r['id']);
            // if multi polygone, will only see first. base on rectangle for now
            features.push(pointfeature);
        }
        ++i;
    }
    // clean cluster source
    clusterVectorSource.addFeatures(features);
    clusterLayer.setVisible(true); 
}

function getVariableForDatataset(dataset)
{
    let ret_html = ""
    // if ckan_server support eov, then used it for variable link
    if ( ckan_server.support_eov == true)
    {
        dataset['eov'].forEach( function(entry){
            let thumb =  ckan_server.getVariableThumbnail(entry);
            if ( thumb !== undefined )
            {
                ret_html += "<img src='" + `${ckan_server.imagesDir}/thumbnails/` + thumb + "'></img>";
            }
        });
    }
    else
    {
        // Use tag to identify variable available. Temporary solution
        if (dataset['keywords'] !== undefined )
        {
            // open canada keywords
            // go through all keyword abs check if variable fit
            dataset['keywords']["en"].forEach( function(entry){
                // need to optimse with dictionary
                let thumb =  ckan_server.getVariableThumbnail(entry);
                if ( thumb !== undefined )
                {
                    ret_html += "<img src='" + `${ckan_server.imagesDir}/thumbnails/` + thumb + "'></img>";
                }
            });
        }
        else if ( dataset['tags'] !== undefined )
        {
            // slgo tags
            // go through all keyword tags check if variable fit
            dataset['tags'].forEach( function(entry){
                // need to optimse with dictionary
                let thumb =  ckan_server.getVariableThumbnail(entry["name"]);
                if ( thumb !== undefined )
                {
                    ret_html += "<img src='" + `${ckan_server.imagesDir}/thumbnails/` + thumb + "'></img>";
                }
            });
        }
    }
    return ret_html;
}

function getCategoriesForDataset(dataset)
{
    let ret_html = "<ul>"
    // if ckan_server support eov, then used it for variable link
    if ( ckan_server.support_eov == true)
    {
        dataset['eov'].forEach( function(entry){
            // search eov for matching variable
            let catvar =  ckan_server.getVariableForEOV(entry);
            if ( catvar !== undefined )
            {
                // use lable for now, requires parent category too
                // must not reuse the same variable !
                ret_html += "<li>" + i18nStrings.getTranslation(catvar["label"]) + "</li>";
            }
        });
    }
    ret_html += "</ul><br />"
    return ret_html;
}

function getToolForDataset(dataset)
{
    // Use resources to identify tool available. Temporary solution
    // should be possible to detect ERDAPP, OCTO or other link to tools
    let ret_html = ""
    dataset['resources'].forEach( function(entry)
    {
        if ( entry['format'] == 'PDF')
        {
           // add PDF with link
           ret_html += "<a href='" + entry['url'] + "' class='asset-link' target='_blank' role='button'>PDF</a> "
        }
        else if ( entry['format'] == 'WMS')
        {
           // add PDF with link
           ret_html += "<a href='" + entry['url'] + "' class='asset-link' target='_blank' role='button'>WMS</a> "
        }
        else if ( entry['format'] == 'CSV')
        {
           // add PDF with link
           ret_html += "<a href='" + entry['url'] + "' class='asset-link' target='_blank' role='button'>CSV</a> "
        }
    });
    return ret_html;
}

function generateCompleteDetailsPanel( dataset )
{
    // Add variable, description and tool accessà
    let ret_html = '';
    ret_html += '<div class="card card-body">'
    if ( ckan_server.support_eov == true)
    {
        // add categories from variable
        ret_html += "<span class='details_text'>" + i18nStrings.getUIString("category") + "</span>";
        ret_html += getCategoriesForDataset( dataset);
    }
    ret_html += "<span class='details_text'><strong>" + i18nStrings.getUIString("dataset_description") + "</strong></span>";
    if ( ckan_server.support_multilanguage)
    {
        ret_html += "<p class='details_label'>" + i18nStrings.getTranslation(dataset['notes_translated']) + "</p>";
    }
    else
    {
        ret_html += "<p class='details_label'>" + dataset['notes'] + "</p>";
    }
    ret_html += '<div class="asset-data-links"><span>' + i18nStrings.getUIString("dataset_tools") + ':</span>';
    ret_html += '<a target="_blank" href="' +  ckan_server.getURLForDataset( dataset["id"] ) + '" class="asset-link" target="_blank" role="button">CKAN</a> ';
    ret_html += getToolForDataset(dataset);
    ret_html += '</div><br />';
    ret_html += "<p class='details_label details_heading'>" + i18nStrings.getUIString("dataset_provider") + ": <a href='" + ckan_server.getURLForOrganization(dataset['organization']['name']) + "' target='_blank'>" + " <span class='details_text'>" + i18nStrings.getTranslation(dataset["organization"]["title_translated"]) + "</span></a></p>"
    ret_html += "</div>";
    return ret_html;
}

function generateDetailsPanel( dataset ) //, language, dataset_id, title, description, provider, link_url, prov_url)
{   let spatial = getDatasetSpatialData(dataset);
    let ret_html = "<div id='" + dataset["id"] + "'class='asset_details'>";
    // check if geomeetry details available for this dataset
    if ( spatial && spatial['type'] === 'Polygon')
    {
        ret_html += '<a href="#" onclick="showInGeometryLayer(\'' + dataset["id"] + '\')" title="' + i18nStrings.getUIString("map") + `"><img class="map-marker" src="${ckan_server.imagesDir}/map-marker.svg"></a>`;
    }
    
    let title = ckan_server.support_multilanguage ? i18nStrings.getTranslation(dataset['title_translated']) : dataset['title'];
    ret_html += '<h3 class="details_label">' + '<a data-toggle="collapse" href="#' + dataset["id"] + '_collapse' + '" role="button" onclick="showDatasetDetailDescription(\'' + dataset["id"] + '\');">' + title + '</a></h3>'; 
    
    // ret_html += '<div class="asset-actions">';
    // ret_html += '<span class="details_label">Information:</span>';
    // ret_html += '<a data-toggle="collapse" href="#' + dataset["id"] + '_collapse' + '" role="button" onclick="showDatasetDetailDescription(\'' + dataset["id"] + '\');">' + i18nStrings.getUIString("details") + '</a>';
    // ret_html += '<button type="button" class="button" onclick="selectAndCenterFeatureOnMap(\'' + dataset["id"] + '\');">Map</button> ';
    // ret_html += '<a class="button" data-toggle="collapse" href="#' + dataset["id"] + '_collapse' + '" role="button">details</a>';
    // ret_html += '</div>';
    ret_html += '<div class="collapse" id="' + dataset["id"] + '_collapse' + '">';
    ret_html += "</div>";
    ret_html += "</div>";
    return ret_html;
}



function DisplayCkanDatasetDetails(data)
{
    let html_dataset = "";
    let i = 0;
    let results = data['result']['results'];
    while ( i < results.length ) {
        let r = results[i];
        // if complete dataset then add to cache
        if ( ckan_server.restrict_json_return == false)
        {
            ckan_server.datasetDetails[r['id']] = r;
        }
        html_dataset += generateDetailsPanel( r );
        //"fr", r['id'], i18nStrings.getTranslation(r['title_translated']), i18nStrings.getTranslation(r['notes_translated']), r['organization']['title'], 'https://test-catalogue.ogsl.ca/dataset/', r['organization']['name']);
        ++i;
    }
    document.getElementById('dataset_desc').innerHTML = html_dataset;
}

function AddToDisplayCkanDatasetDetails(data)
{
    let html_dataset = "";
    let i = 0;
    let results = data['result']['results'];
    while ( i < results.length ) {
        let r = results[i];
         // if complete dataset then add to cache
         if ( ckan_server.restrict_json_return == false)
         {
             ckan_server.datasetDetails[r['id']] = r;
         }
        html_dataset += generateDetailsPanel(  r );
        //['id'], i18nStrings.getTranslation(r['title_translated']), i18nStrings.getTranslation(r['notes_translated']), r['organization']['title'], 'https://test-catalogue.ogsl.ca/dataset/', r['organization']['name']);
        ++i;
    }
    document.getElementById('dataset_desc').innerHTML += html_dataset;
}


function displayTotalSearchDetails( total, paging )
{
    let stat_html = "";
    if ( paging != undefined)
    {
        stat_html += "<span class='stat_count'>" + paging.toString() + " / " + + total.toString() + "</span>"
    }
    else
    {
        stat_html += "<span class='stat_count'>" + total.toString() + "</span>";
    }
    stat_html += "<a class='btn btn-info btn-sm' target='_blank' href='" + ckan_server.getHomeCatalogURL() +"'>" + i18nStrings.getUIString("more_data_catalog") + " " + i18nStrings.getUIString("catalog") + "</a>";
    document.getElementById('dataset_search_stats').innerHTML = stat_html;
}

function displayCKANSearchDetails( data)
{
    displayTotalSearchDetails( data["result"]["count"])
}

function addAndDisplaydataset(data)
{
    // continue paging data until no more is required
    var notdisplayed = true;
    // query is still relevant ( hasn't changed since the request )
    if ( ckan_server.currentFilterQuery != ckan_server.lastFilterChange )
    {
        return;
    }

    if ( ckan_server.lastPagedDataIndex > ckan_server.slowDownPagingTreshold)
    {
            AddToDisplayCkanDatasetDetails(data);
            if ( useClustering )
            {
                AddDisplayCKANClusterIcon(data);
            }
            else
            {
                AddDisplayCKANExtent(data);
            }
            notdisplayed = false;
    }
    // make the call before adding the data so server side can compute
    // while client render or after for older machine / large result?
    if ( ckan_server.currentFilterQuery == ckan_server.lastFilterChange )
    {
        // verify if paging is stil required
        let totaldataset =  parseInt(data["result"]["count"]);
        if ( ckan_server.lastPagedDataIndex < totaldataset)
        {
            // continue paging
            displayTotalSearchDetails( data["result"]["count"], ckan_server.lastPagedDataIndex );

            let url_ckan = ckan_server.getURLPaginated( ckan_server.lastPagedDataIndex, ckan_server.resultPageSize);
            ckan_server.lastPagedDataIndex += ckan_server.resultPageSize;
            // request first page of dataset

            fetchCKAN( url_ckan).then(addAndDisplaydataset);
        }
        else
        {
            displayTotalSearchDetails( totaldataset, totaldataset );
        }
    }
    // query still hasn't changed during processing?
    if ( ckan_server.currentFilterQuery == ckan_server.lastFilterChange )
    {
        // was under the treshold for paging slowdown, need to display now
        if ( notdisplayed )
        {
            AddToDisplayCkanDatasetDetails(data);
            if ( useClustering )
            {
                AddDisplayCKANClusterIcon(data);
            }
            else
            {
                AddDisplayCKANExtent(data);
            }
        }
    }   
}

function searchAndDisplayDataset(data)
{
    if ( ckan_server.hasfilterquery == false)
    {
        // oups, ajax took to long, no more filter, don't display anything
        return;
    }
    // start of a new possible pagination, set current to last, even is too fast, it will be updated afterward?
    // No way to identify the request made since no param or user define info can be returned
    ckan_server.currentFilterQuery = ckan_server.lastFilterChange;
    // call create map layer, description panel and stats
    displayCKANSearchDetails(data);
    DisplayCkanDatasetDetails(data);
    if ( useClustering )
    {
        displayCKANClusterIcon(data);
    }
    else
    {
        displayCKANExtent(data);
    }

    // if result count is bigger than the rows return, call add dataset
    var totaldataset =  parseInt(data["result"]["count"]);
    if ( totaldataset > ckan_server.initialPageSize )
    {
        ckan_server.lastPagedDataIndex = ckan_server.initialPageSize;
        displayTotalSearchDetails( totaldataset, ckan_server.lastPagedDataIndex );

        let url_ckan = ckan_server.getURLPaginated( ckan_server.lastPagedDataIndex, ckan_server.resultPageSize);
        ckan_server.lastPagedDataIndex += ckan_server.resultPageSize;
        // request first page of dataset

        fetchCKAN( url_ckan).then( addAndDisplaydataset );
    }
    else
    {
        displayTotalSearchDetails( totaldataset, totaldataset );
    }
}

function clearAllDatasets()
{
    // clear search statistics
    displayTotalSearchDetails( 0);
    // clear dataset description
    document.getElementById('dataset_desc').innerHTML = "";

    // clear map display
    if (clusterLayer !== undefined){
        clusterLayer.setVisible(false);   
        clusterVectorSource.clear();
    }
    vectorLayer.setVisible(false);
    let vectorSource= vectorLayer.getSource();
    vectorSource.clear();
    // map.addLayer(vectorLayer);
     // update map

}

function checkCKANData()
{
    // update the current state of filters ( use to check for parelle paging of data)
    ckan_server.lastFilterChange += 1;

    // remove data from the map and on the list, will be reconstructed with the paginated search
    clearAllDatasets();
    ckan_server.hasfilterquery = false;
    // verify if filters are active, if not, remove all data and don't access the entire catalogue
    if ( ckan_server.hasActiveFilter() )
    {
        ckan_server.hasfilterquery = true;
        // use CKAN config to write call to package_search

        let url_ckan = ckan_server.getURLPaginated(0, ckan_server.initialPageSize);

        fetchCKAN(url_ckan).then(searchAndDisplayDataset)
    }
}

function setLocationAndCheck(location){
    ckan_server.setCustomBbox(
      location
    );
    checkCKANData()
  }

function updateDatasetDetails( datasets )
{
    let element = datasets['result'];
    ckan_server.datasetDetails[element['id']] = element;
    // update and open panel
    let itemid = '#' + element['id'] + '_collapse';
    document.getElementById(element['id'] + '_collapse').innerHTML = generateCompleteDetailsPanel(element);
    jQuery(itemid).collapse("show");
}

function updateDatasetDetailsFromCache( datasetid )
{
    let element = ckan_server.datasetDetails[datasetid];
    // update and open panel
    let itemid = '#' + element['id'] + '_collapse';
    if (document.getElementById(element['id'] + '_collapse')) {
        document.getElementById(element['id'] + '_collapse').innerHTML = generateCompleteDetailsPanel(element);
    }
    jQuery(itemid).collapse("show");
}

// sadly default parameter assignation not suported by IE 11
//function showDatasetDetailDescription( datasetid , goto_description = true, select_point = true, center_point = true)
function showDatasetDetailDescription( datasetid , goto_description, select_point, center_point)
/**
 * Shows Dataset Detail Description and adjusts the scroll so that detail panel is visible
 * @param  {[string]} datasetid
 * @param  {[bool]} goto_description - scroll to the current description in the right panel if True
 * @param  {[bool]} select_point - selects corresponding feature (point) on the map
 * @param  {[bool]} center_point - center corresponding feature (point) on the map
 */
{

    // trick to set parameter by default
    if ( goto_description == undefined)
    {
        goto_description = true;
    }
    if ( select_point == undefined)
    {
        select_point = true;
    }
    if ( center_point == undefined)
    {
        center_point = true;
    }
    // collapse other detail panels
    jQuery('#dataset_desc').find('.collapse').each(function() {
        if (jQuery(this).attr('id') != datasetid) {
            jQuery(this).collapse('hide');
        }
    });
    // load details panel
    callDatasetDetailDescription(datasetid);
    // scroll up to this panel
    if (goto_description) {
        jQuery("#"+datasetid).on("shown.bs.collapse", function() {
            let topPos = jQuery('#dataset_desc').scrollTop() + jQuery("#"+datasetid).position().top;
            jQuery('#dataset_desc').animate({scrollTop:topPos}, 500);
        });
    }
    if (select_point) {
        selectFeatureOnMap(datasetid);
    }
    if (center_point) {
        centerFeatureOnMap(datasetid);
    }
}

function fetchCKAN(url){
    let config={};

    if ( ckan_server.use_basic_auth)
    {
        config = { headers:{'Authorization': 'Basic ' + btoa(ckan_server.basic_auth_user + ':' + ckan_server.basic_auth_password)} };
    }

    return fetch(url,config).then(res=>{
        if(res.ok){
            return res.json();
        }
        throw new Error(`Fetch failed with error ${res.status} ${res.statusText}`)
    })
}

function callDatasetDetailDescription( datasetid )
{
    // check cache, if not, make call
    if ( datasetid in ckan_server.datasetDetails )
    {
        // details already in cache
        updateDatasetDetailsFromCache(datasetid);
        return;
    }
    let url_ckan = ckan_server.getDatasetShowURL(datasetid);

    fetchCKAN(url_ckan).then(updateDatasetDetails);
}

export {CKANServer, clearAllDatasets, checkCKANData, showDatasetDetailDescription, getStyleFromClusterConfig}