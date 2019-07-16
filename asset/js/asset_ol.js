
var vectorSource= new ol.source.Vector({
    features: []
});

var polyStyle =  new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'blue',
        lineDash: [4],
        width: 3
    }),
    fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
    })
});
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: polyStyle
});


var language = document.getElementById('language');
var list_dataset = document.getElementById('list_dataset');

var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click
});

var map = new ol.Map({
    layers: [
        new  ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        vectorLayer
    ],
    target: 'map',
    view: new ol.View({
        center: [0, 0],
        zoom: 2
    })
});

map.addInteraction(selectClick);
selectClick.on('select', function(e) {
    // aficher popupt avec title selon la langue ainsi que le titre clikable vers la page CKAN du dataset
    //var f = e.selected[0];
    //console.log(f);
    // document.getElementById('dataset_link').innerHTML = '&nbsp;' + f['values_']['title'];
    // document.getElementById('dataset_link').setAttribute('href', f['values_']['page_link']);
    //linkhtml = '<a href="' +  f['values_']['page_link'] +'">'  + f['values_']['title'] + '</a>'
    // document.getElementById('dataset_desc').innerHTML = linkhtml + '<br />&nbsp;' + f['values_']['description'];
});