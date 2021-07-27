import * as ol from "ol";
import * as condition from "ol/events/condition";
import * as interaction from "ol/interaction";
import * as proj from "ol/proj";
import * as source from 'ol/source';
import * as extent from 'ol/extent';
import * as geom from 'ol/geom';
import * as layer from "ol/layer"
import * as style from 'ol/style';


import jQuery from "jquery";
window.jQuery = jQuery;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/collapse';

import {getStyleFromClusterConfig, checkCKANData, showDatasetDetailDescription} from "./asset_ckan"
import i18nStrings from "./asset_i18n"
import {ckan_server} from "./asset"

var vectorsource = null;
var vectorLayer = null;
var hoverSource = null;
var polystyle = null;
var polyLayer = null;
var hoverlayer = null;
var clusterLayer = null;
var clusterVectorSource = null;
var clusterSource = null;
var clusterStyleCache = {};
var clusterStyleConfig = {};

var selectDoubleCLick = null;
var selectClick = null;
var selectPointerMove = null;
var map = null;
var useClustering = false;
let startview;
// list of possible layers as background indexed by name from config
var bacground_layers = {};

// cache dataset centroid and geometry
// coucld reuse vector source and cluster source?
var datasetGeometryCache = {};


function CreateBackgroundLayerFromConfig( lconfig )
{
    let ret = undefined;
    // switch type
    if ( lconfig['type'] === "OpenStreetMap")
    {
        ret = new layer.Tile({
            visible: false,
            source: new source.OSM()
        })
    }
    else if ( lconfig['type'] === "Bing")
    {
        ret = new layer.Tile({
            visible: false,
            preload: Infinity,
            source: new source.BingMaps({
              key: lconfig['key'],
              imagerySet: lconfig['imagerySet']
              // use maxZoom 19 to see stretched tiles instead of the BingMaps
              // "no photos at this zoom level" tiles
              // maxZoom: 19
            })
          });
    }
    else if ( lconfig['type'] === "wms")
    {
        ret = new layer.Tile({
            visible: false,
            source: new source.TileWMS({
              url: lconfig['server_url'],
              params: {'LAYERS': lconfig['layer_name'], 'TILED': true},
              serverType: lconfig['serverType'],
              transition: 0
            })
          });
    }
    return ret;
}

function initMapFromConfig(config)
{

    addMapSelctionDropdown(config);

    let vectorSource= new source.Vector({
        features: []
    });

    hoverSource = new source.Vector({
        features: []
    });

    let polyStyle =  new style.Style({
        stroke: new style.Stroke(
            config["Polystyle"]["Stroke"]),
        fill: new style.Fill(
            config["Polystyle"]["Fill"])
    });

    vectorLayer = new layer.Vector({
        source: vectorSource,
        style: polyStyle
    });

    hoverlayer= new layer.Vector({
        source: hoverSource,
        style: polyStyle
    });

    clusterStyleConfig = config["icon_cluster"];


    // current view is cluster if true
    useClustering = config["start_cluster"];


     // create layer if null
    clusterVectorSource = new source.Vector({
    });

    clusterSource = new source.Cluster({
        distance: clusterStyleConfig["distance"],
        source: clusterVectorSource
      });

    clusterStyleCache = {};
    clusterLayer = new layer.Vector({
        source: clusterSource,
        style: function(feature) {
          let featuresSize = feature.get('features')
          let curstyle;
          if ( featuresSize != undefined)
          {
            let size = feature.get('features').length;
            curstyle = clusterStyleCache[size];
            if (!curstyle) {
                let cfg = getStyleFromClusterConfig(clusterStyleConfig, size);
                curstyle = new style.Style({
                image: new style.Circle({
                    radius: cfg["circle_radius"],
                    stroke: new style.Stroke({
                    color: cfg["stroke_color"]
                    }),
                    fill: new style.Fill({
                    color: cfg["fill_color"]
                    })
                }),
                text: new style.Text({
                    text: size.toString(),
                    fill: new style.Fill({
                    color: cfg["text_color"]
                    })
                })
                });
                clusterStyleCache[size] = curstyle;
            }
          }
          return curstyle;
        }
      });
    // clusterLayer.setZIndex(10);
    // update map

    selectClick = new interaction.Select({
        condition: condition.click
    });

    selectDoubleCLick = new interaction.Select({
        condition: condition.doubleClick
    });


    selectPointerMove = new interaction.Select({
        condition: condition.pointerMove
      });

    startview = new ol.View(
        config["start_view"]);
    // transform center from WGS84 lat/long
    startview.setCenter( proj.transform(config["start_view"]["center"], 'EPSG:4326', 'EPSG:3857'));

    if ( "backgrouns_layers" in config)
    {
        config["backgrouns_layers"].forEach( function(element)
            {
                let blayer = CreateBackgroundLayerFromConfig(element);
                if ( blayer !== undefined)
                {
                    bacground_layers[element['name']] = blayer;
                }
            }
        );
    }
    if ( Object.keys(bacground_layers).length == 0)
    {
        // if no background layer defined, add default OpenStreetMap
        bacground_layers['default'] = new layer.Tile({
            visible: false,
            source: new source.OSM()
        });
    }

    vectorLayer.setVisible(false);
    if ( !( "start_layer" in config) )
    {
        // can't find start layer in config, use first layer
        bacground_layers[Object.keys(bacground_layers)[0]].setVisible(true);
    }
    else
    {
        bacground_layers[config['start_layer']].setVisible(true);
    }
    
    // still not supported by IE 11
    // let maplayers = Object.values(bacground_layers);
    let maplayers = Object.keys(bacground_layers).map(function(e) {
        return bacground_layers[e]
      });

    maplayers.push(vectorLayer);
    maplayers.push(hoverlayer);
    maplayers.push(clusterLayer);
    map = new ol.Map({
        layers: maplayers,
        target: 'map',
        // needs to come form config
        view: startview
    });

    map.addInteraction(selectClick);
    map.addInteraction(selectDoubleCLick);
    map.addInteraction(selectPointerMove);
    selectClick.on('select', function(e) {
        // if details panel close, open drawer
        // open details of selected feature dataset
        let f = e.selected[0];
        if(f) {
            //let scroll_to_description = f['values_']['features'].length > 1 ? false : true; // don't scroll if there are many points in one
            let center_on_map = true;  // center on the first feature in the collection and on the description too
            f['values_']['features'].forEach( function(element)
                {
                    // call package show and update details panel
                    showDatasetDetailDescription(element['values_']['id'], center_on_map, false, center_on_map);
                    center_on_map = false;
                }
            );
            // $('#' + f['values_']['id'] + '_collapse').collapse("show");
            // document.getElementById(f['values_']['id']).scrollIntoView();
            // $('#' + f['values_']['id']).scrollIntoView();
            // hide last selected
        }
    });

    var dragBox = new interaction.DragBox({
        condition: condition.platformModifierKeyOnly
      });

    map.addInteraction(dragBox);

    dragBox.on('boxend', function() {
        // features that intersect the box are added to the collection of
        // selected features
        var coordinates = dragBox
          .getGeometry()
          .transform("EPSG:3857", "EPSG:4326")
          .getExtent()

        ckan_server.setCustomBbox(
          coordinates.map(function(value) {
            return parseInt(value);
          })
        );
        checkCKANData()
      });

    selectDoubleCLick.on('select', function(e) {
        // if details panel close, open drawer
        // open details of selected feature dataset
        let f = e.selected[0];
        if ( f !== undefined )
        {
            // if is cluster
            // calculate extent
            // animate zoom to extent
            // if only one feature in cluster, than show entire geom et go to description
            if ( 'features' in f['values_'])
            {
                let coords = [];

                f['values_']['features'].forEach( function(element)
                    {
                        // call package show and update details panel
                        coords.push(element['values_']['geometry']['flatCoordinates']);
                    }
                );
                let newBound = extent.boundingExtent(coords);
                map.getView().fit(newBound, { duration: 1000 });
            }
            else
            {
                // is not, this a specific region or dataset
                console.log('specific feature');
                console.log(f['values_']['id']);
            }
        }
    });

    selectPointerMove.on('select', function(e) {
        let f = e.selected[0];
        // highlight details panel of hovered feature dataset
        if ( f !== undefined )
        {
            // look if f contains features in the values, if so, this is a cluster
            if ( 'features' in f['values_'])
            {
                console.log('found features list: ' + f['values_']['features'].length);
            }
            else
            {
                // is not, this a specific region or dataset
                console.log('specific feature');
                console.log(f['values_']['id']);
            }

        }
        else
        {
            // pointer move to nothing ( out of object event )
            console.log('pointer out of object');
        }
    });

}

function clearGeometryCache()
{
    datasetGeometryCache = {};
}


function addGeometryToCache(id, spatial)
{
    // take spatial json as is
    datasetGeometryCache[id] = spatial;
}


function changeBackgrounLayer( layername )
{
    if ( layername in bacground_layers)
    {
        // set layer visible
        bacground_layers[layername].setVisible(true);

        // set all others invisible
        for ( let key in  bacground_layers)
        {
            if ( key !== layername)
            {
                bacground_layers[key].setVisible(false);
            }
        }
    }
}

function showInGeometryLayer( id )
{
    // Display the spatial geometry in the vector layer
    // set id to the dataset id ( select )

    // clear the source to be sure that only one geometry is displayed
    let cursource = vectorLayer.getSource();
    cursource.clear();

    // create vector geometry object and set properties
    var feature = new ol.Feature({
        geometry: new geom.Polygon(datasetGeometryCache[id]['coordinates'])
    });
    feature.setId(id);
    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    // set id to link to description panel
    feature.set('id', id);

    cursource.addFeature(feature);
    // update the map
    vectorLayer.setVisible(true);

    var newBound = cursource.getExtent();
    // map.getSize(),
    map.getView().fit(newBound, { duration: 1000 });
    // move map and zoom to fit geometry
    //startview.animate(  {center: ol.proj.transform(getCenterOfCoordinates(datasetGeometryCache[id]['coordinates'][0]), 'EPSG:4326', 'EPSG:3857')});
}


function getFeaturePointById ( id )
/**
 * Gets the feature (point) on the map view by datasetid
 * @param  {[string]} datasetid [element]
 * @return {Feature} Feature object
 */
{
    // get feature from vector layer
    let f = vectorLayer.getSource().getFeatureById(id);
    if (!f) {
        f = clusterVectorSource.getFeatureById(id);
    }
    return f;
}

function selectFeatureOnMap( id )
/**
 * Selects the feature on the map
 * @param  {[string]} datasetid [element]
 */
{
    let f = getFeaturePointById(id);

    if (f) {
        selectClick.getFeatures().clear();
        selectClick.getFeatures().push(f);
    }
}

function centerFeatureOnMap( id )
/**
 * Centers the view on the feature given
 * @param  {[string]} datasetid [element]
 */
{
    let f = getFeaturePointById(id);

    if (f) {
        // center view on feature
        var point = f.getGeometry();
        let center = point.getCoordinates();
        
        // if the object is a polygon there can be many coordinates which 
        // is causing the map to dissappear
        if(center.length == 2)
            startview.animate( {center} );
    }
}

function selectAndCenterFeatureOnMap( id )
{
    selectFeatureOnMap(id);
    centerFeatureOnMap(id);
}

window.asset_change_base_layer=asset_change_base_layer;

// Should have code to add dataset to layer here

function addMapSelctionDropdown( config )
{
    if ( "backgrouns_layers" in config)
    {
        // add the select object and the bottom left of the map div
        let domstr = '<div id="background_map_div_select" class="background_map_div_select">';
        domstr += '<span style="text-shadow: 1px 1px 2px #FFFFFF;">' + i18nStrings.getUIString("background_map") + '</span>';
        domstr += '<select id="sel_asset_base_layer" onchange="asset_change_base_layer();">';
        config["backgrouns_layers"].forEach( function(element)
            {
                domstr += '<option value="' + element['name'] + '"';
                if ( element['name'] === config["start_layer"] )
                {
                    domstr += ' selected="selected"'
                }
                domstr += '">' + i18nStrings.getTranslation(element["label"]) + '</option>';
            }
        );
        domstr += '</select></div>';
    // append to the div map
        document.getElementById('asset_map_container').innerHTML += domstr;
    }
    // add the select object and the bottom left of the map div
}

function asset_change_base_layer()
{

    let desired_layer = jQuery( "#sel_asset_base_layer" ).val();
    changeBackgrounLayer(desired_layer);
}

export {addGeometryToCache, clusterVectorSource, vectorLayer, clusterLayer, useClustering, selectFeatureOnMap, initMapFromConfig, centerFeatureOnMap, showInGeometryLayer, changeBackgrounLayer} 
