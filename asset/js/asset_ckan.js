



function CKANServer()
{
    this.url = 'ckan';
    this.varriables = [];

    this.loadConfig= function (config) {
        this.url = config["access_url"];
        this.homeUrl = config["base_url"];
    };

    this.getHomeCatalogURL = function() {
        return this.homeUrl;
    };

    this.getURLForDataset = function( datasetId ) {
        return this.homeUrl + '/dataset/' + datasetId;
    };

    this.getURLForOrganization = function( organisationId ) {
        return this.homeUrl + '/organization/' + organisationId;
    };

    this.writeURL = function () {
        ret_url =  this.url + 'q=';

        v=0;
        while( v < this.varriables.length)
        {
            // get element for variable
            varData = this.varriables[v];
            varItem = document.getElementById(varData["id"]);
            // if checked, add text to the filter
            if ( varItem.checked )
            {
                ret_url += varData["ckantext"] + ',';
            }
            ++v;
        }
        return ret_url;
    };

    // list of variables
    // rewtite URL to CKAN with search criteria
    //


    this.addVariable = function ( variableName ) {
        // should be a dictionnary and don't add multiple time
        this.varriables.push(variableName);
    };

    this.clearVariables = function ()
    {
        this.varriables = [];
    };

    this.getCKANData = function ()
    {
        // call proxy with url and variable
        url = this.writeURL();
        $.getJSON( url, afficheCKANExtent );
        //$.getJSON( "https://test-catalogue.ogsl.ca/api/3/action/package_search?ext_bbox=-104,17,-18,63&q=" + document.getElementById('searchbox').value, afficheCKANExtent );
    };
}

function addCKANExtent(data)
{
    // add extent to the one already available
}


function displayCKANExtent( data )
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
            objspatial = JSON.parse(r["spatial"]);
        }
        else if ( r['extras'] != undefined)
        {
            // slgo + extension spatial schema
            r['extras'].forEach( function(entry)
            {
                if ( entry['key'] == 'spatial')
                {
                    var obj = JSON.parse(entry['value']);
                }
            });
        }
        if ( objspatial != undefined )
        {
            // Create geometry feature as polygone (rect extent)
            var feature = new ol.Feature({
                geometry: new ol.geom.Polygon(objspatial['coordinates'])
            });
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // Add properties from selected language
            if (language.selectedIndex === 0){
                feature.set('title', r['title_translated']['fr']);
                feature.set('description', r['notes_translated']['fr']);
            } else {
                feature.set('title', r['title_translated']['en']);
                feature.set('description', r['notes_translated']['en']);
            }
            features.push(feature);
        }
        ++i;
    }
    // recreate layer 
    map.removeLayer(vectorLayer);
    vectorSource= new ol.source.Vector({
        features: features
    });
    vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: polyStyle
    });
    map.addLayer(vectorLayer);
    // update map
}

function generateDetailsPanel( language, dataset_id, title, description, provider, link_url, prov_url)
{
    ret_html = "<div id='" + dataset_id + "' class='asset_details'>";
    ret_html += "<span class='details_label'>" + ui_str["dataset_title"][language] + "</span><br />";
    ret_html += "<span class=''details_text>" + title + "</span><br />";
    ret_html += "<div style='display: none;'>";
    ret_html += "<span class='details_label'>" + ui_str["dataset_description"][language] + "</span><br />";
    ret_html += "<span class=''details_text>" + description + "</span><br />";
    ret_html += "<span class='details_label'>" + ui_str["dataset_provider"][language] + "</span><a href='" + ckan_server.getURLForOrganization(prov_url) + "'>up</a>";
    ret_html += "<span class=''details_text>" + provider + "</span><br />";
    ret_html += "<span class='details_label'>" + ui_str["dataset_tools"][language] + "</span><br />";
    ret_html += "</div>";
    ret_html += '<a target="_blank" href="' +  ckan_server.getURLForDataset( dataset_id ) + '">CKAN</a>';
    ret_html += "</div>";
    return ret_html;
}

function DisplayCkanDatasetDetails(data)
{
    var html_dataset = "";
    var i = 0;
    var results = data['result']['results'];
    while ( i < results.length ) {
        var r = results[i];
        if (language.selectedIndex === 0) {
            html_dataset += generateDetailsPanel( "fr", r['id'], r['title_translated']['fr'], r['notes_translated']['fr'], r['organization']['title'], 'https://test-catalogue.ogsl.ca/dataset/', r['organization']['name']);
        } else {
            html_dataset += generateDetailsPanel("en", r['id'], r['title_translated']['en'], r['notes_translated']['en'], r['organization']['title'], 'https://test-catalogue.ogsl.ca/dataset/', r['organization']['name']);
        }
        ++i;
    }
    document.getElementById('dataset_desc').innerHTML = html_dataset;
}


function displayCKANSearchDetails(language, data)
{
    stat_html = "<span class='stat_count'>" + data["result"]["count"] + "</span><br />";
    stat_html += "<span class='more_info_in'>" + ui_str["more_data_catalog"][language] + "</span><br />";
    stat_html += "<a target='_blank' href='" + ckan_server.getHomeCatalogURL() +"'>" + ui_str["catalog"][language] + "</a>";
    document.getElementById('dataset_search_stats').innerHTML = stat_html;
}

function addAndDisplayDataset(data)
{
    // call create map layer, description panel and stats
    displayCKANSearchDetails("fr", data);
    DisplayCkanDatasetDetails(data);
    displayCKANExtent(data);
}


function checkCKANData()
{
    // use CKAN config to write call to package_search
    url = ckan_server.writeURL();
    // request first page of dataset
    $.getJSON( url, addAndDisplayDataset );
}