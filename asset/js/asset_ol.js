
var vectorsource = null;
var polystyle = null;
var polyLayer = null;
var clusterLayer = null;
var clusterVectorSource = null;
var clusterSource = null;
var clusterStyleConfig = {};
var selectClick = null;
var selectPointerMove = null;
var map = null;
var useClustering = false;

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
        ret = new  ol.layer.Tile({
            visible: false,
            source: new ol.source.OSM()
        })
    }
    else if ( lconfig['type'] === "Bing")
    {
        ret = new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
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
        ret = new ol.layer.Tile({
            visible: false,
            source: new ol.source.TileWMS({
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
    vectorSource= new ol.source.Vector({
        features: []
    });
    
    polyStyle =  new ol.style.Style({
        stroke: new ol.style.Stroke(
            config["Polystyle"]["Stroke"]),
        fill: new ol.style.Fill(
            config["Polystyle"]["Fill"])
    });

    vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: polyStyle
    });

    clusterStyleConfig = config["icon_cluster"];


    // current view is cluster if true
    useClustering = config["start_cluster"];


    clusterLayer = undefined;
    clusterSource = undefined;

    selectClick = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    // selectPointerMove = new ol.interaction.Select({
    //     condition: ol.events.condition.pointerMove
    //   });

    startview = new ol.View(
        config["start_view"]);
    // transform center from WGS84 lat/long
    startview.setCenter( ol.proj.transform(config["start_view"]["center"], 'EPSG:4326', 'EPSG:3857'));

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
        bacground_layers['default'] = new  ol.layer.Tile({
            visible: false,
            source: new ol.source.OSM()
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
    let maplayers = Object.values(bacground_layers);
    maplayers.push(vectorLayer);
    map = new ol.Map({
        layers: maplayers,
        target: 'map',
        // needs to come form config
        view: startview
    });

    map.addInteraction(selectClick);
    // map.addInteraction(selectPointerMove);
    selectClick.on('select', function(e) {
        // if details panel close, open drawer
        // open details of selected feature dataset
        let f = e.selected[0];
        f['values_']['features'].forEach( function(element)
            {
                // call package show and update details panel
                showDatasetDetailDescription(element['values_']['id']);
            }
        );
        // $('#' + f['values_']['id'] + '_collapse').collapse("show");
        // document.getElementById(f['values_']['id']).scrollIntoView();
        // $('#' + f['values_']['id']).scrollIntoView();
        // hide last selected
    });

    // selectPointerMove.on('select', function(e) {
    //     f = e.selected[0];
    //     // highlight details panel of hoovered feature dataset
    //     if ( f !== undefined )
    //     {
    //         console.log(f['values_']['id']);
    //     }
    // });
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
        geometry: new ol.geom.Polygon(datasetGeometryCache[id]['coordinates'])
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


function selectFeatureOnMap( id )
{
    // get feature from vector layer
    f = vectorLayer.getSource().getFeatureById(id);
    if ( f !== undefined )
    {
        selectClick.getFeatures().push(f);
        // center view on feature
        startview.animate(  {center: ol.proj.transform(f['values_']['center'], 'EPSG:4326', 'EPSG:3857')})
        //startview.setCenter( ol.proj.transform(f['values_']['center'], 'EPSG:4326', 'EPSG:3857'));
    }
    else
    {
        f = clusterLayer.getSource().getFeatureById(id);
        if ( f !== undefined )
        {
            alert(id);
            //selectClick.getFeatures().push(f);
            // center view on feature
            //startview.animate(  {center: ol.proj.transform(f['values_']['center'], 'EPSG:4326', 'EPSG:3857')})
            //startview.setCenter( ol.proj.transform(f['values_']['center'], 'EPSG:4326', 'EPSG:3857'));
        }
    }
}

// Should have code to add dataset to layer here
