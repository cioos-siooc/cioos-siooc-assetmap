
var vectorsource = null;
var polystyle = null;
var polyLayer = null;
var selectClick = null;
var selectPointerMove = null;
var map = null;


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

    selectClick = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    selectPointerMove = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove
      });

    startview = new ol.View(
        config["start_view"]);
    // transform center from WGS84 lat/long
    startview.setCenter( ol.proj.transform(config["start_view"]["center"], 'EPSG:4326', 'EPSG:3857'));

    map = new ol.Map({
        layers: [
            // backlayer come from config
            new  ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
        target: 'map',
        // needs to come form config
        view: startview
    });

    map.addInteraction(selectClick);
    map.addInteraction(selectPointerMove);
    selectClick.on('select', function(e) {
        // if details panel close, open drawer
        // open details of selected feature dataset
        var f = e.selected[0];
        $('#' + f['values_']['id'] + '_collapse').collapse("show");
        document.getElementById(f['values_']['id']).scrollIntoView();
        // $('#' + f['values_']['id']).scrollIntoView();
        // hide last selected
    });

    selectPointerMove.on('select', function(e) {
        f = e.selected[0];
        // highlight details panel of hoovered feature dataset
        console.log(f['values_']['id']);
    });
}

function selectFeatureOnMap( id )
{
    // get feature from vector layer
    f = vectorLayer.getSource().getFeatureById(id);
    selectClick.getFeatures().push(f);
}