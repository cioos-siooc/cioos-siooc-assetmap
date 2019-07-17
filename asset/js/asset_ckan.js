



function CKANServer()
{
    this.url = 'ckan';
    this.homeURl  = '';
    this.dataset_url = '';
    this.organization_url= '';
    this.varriables = [];

    this.loadConfig= function (config) {
        this.url = config["access_url"];
        this.homeUrl = config["base_url"];
        this.dataset_url = config["dataset_url"];
        this.organization_url= config["organization_url"];
    };

    this.getHomeCatalogURL = function() {
        return this.homeUrl;
    };

    this.getURLForDataset = function( datasetId ) {
        return this.dataset_url + 'dataset/' + datasetId;
    };

    this.getURLForOrganization = function( organisationId ) {
        return this.organization_url + 'organization/' + organisationId;
    };

    // add bbounding box filter
    // add pagination

    this.getURLPaginated = function( startrow, numrow )
    {
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
        ret_url += '&rows=' + numrow.toString() + '&start=' + startrow.toString();
        // bbox
        return ret_url;
    };

    this.hasActiveFilter = function () {
        v=0;
        ret = false;
        while( v < this.varriables.length)
        {
            // get element for variable
            varData = this.varriables[v];
            varItem = document.getElementById(varData["id"]);
            // if checked, add text to the filter
            if ( varItem.checked )
            {
                ret = true;
            }
            ++v;
        }
        return ret;
    };

    this.writeURL = function () {
        // list of variables
        // rewtite URL to CKAN with search criteria
        // write bbox filter if present
        ret_url =  this.url + 'rows=20&q=';

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
            var feature = new ol.Feature({
                geometry: new ol.geom.Polygon(objspatial['coordinates'])
            });
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            feature.set('id', r['id']);
            features.push(feature);
        }
        ++i;
    }
    // recreate layer 
    
    //console.log(vectorLayer);
    cursource = vectorLayer.getSource();
    cursource.addFeatures(features);
    // update map
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
                    objspatial = JSON.parse(entry['value']);
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
            // set id to link to description panel
            feature.set('id', r['id']);
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

function AddToDisplayCkanDatasetDetails(data)
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
    document.getElementById('dataset_desc').innerHTML += html_dataset;
}


function displayTotalSearchDetails(language, total )
{
    stat_html = "<span class='stat_count'>" + total.toString() + "</span><br />";
    stat_html += "<span class='more_info_in'>" + ui_str["more_data_catalog"][language] + "</span><br />";
    stat_html += "<a target='_blank' href='" + ckan_server.getHomeCatalogURL() +"'>" + ui_str["catalog"][language] + "</a>";
    document.getElementById('dataset_search_stats').innerHTML = stat_html;
}

function displayCKANSearchDetails(language, data)
{
    displayTotalSearchDetails(language,  data["result"]["count"])
}

function addAndDisplaydataset(data)
{
    AddToDisplayCkanDatasetDetails(data);
    AddDisplayCKANExtent(data);
}

function searchAndDisplayDataset(data)
{
    // call create map layer, description panel and stats
    displayCKANSearchDetails("fr", data);
    DisplayCkanDatasetDetails(data);
    displayCKANExtent(data);
    // if result count is bigger than the rows return, call add dataset 
    totaldataset =  parseInt(data["result"]["count"]);
    if ( totaldataset > 20 )
    {
        for( i = 0; i < totaldataset / 20; ++i )
        {
            url = ckan_server.getURLPaginated( (i + 1) * 20, 20);
            // request first page of dataset
            $.getJSON( url, addAndDisplaydataset );
        }
    }
}

function clearAllDatasets()
{
    // clear search statistics
    displayTotalSearchDetails("fr", 0);
    // clear dataset description
    document.getElementById('dataset_desc').innerHTML = "";

    // clear map display
     map.removeLayer(vectorLayer);
     vectorSource= new ol.source.Vector({
         features: []
     });
     vectorLayer = new ol.layer.Vector({
         source: vectorSource,
         style: polyStyle
     });
     map.addLayer(vectorLayer);
     // update map

}

function checkCKANData()
{
    // verify if filters are active, if not, remove all data and don't access the entire catalogue
    if ( ckan_server.hasActiveFilter() )
    {
        // use CKAN config to write call to package_search
        url = ckan_server.writeURL();
        // request first page of dataset
        $.getJSON( url, searchAndDisplayDataset );
    }
    else
    {
        // remove all info from layers
        clearAllDatasets();
    }
}