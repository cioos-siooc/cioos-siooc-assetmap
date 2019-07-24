



function CKANServer()
{
    this.url = 'ckan';
    this.homeURl  = '';
    this.dataset_url = '';
    this.organization_url= '';
    this.varriables = [];
    this.currentLanguage = "fr";
    this.bbox = undefined;

    this.loadConfig= function (config) {
        this.url = config["access_url"];
        this.homeUrl = config["base_url"];
        this.dataset_url = config["dataset_url"];
        this.organization_url = config["organization_url"];
        if ( config["start_bbox"] !== undefined )
        {
            if ( config["start_bbox"].length == 4 )
            {
                this.bbox = config["start_bbox"]
            }
        }
    };

    this.getHomeCatalogURL = function() {
        return this.homeUrl;
    };

    this.getURLForDataset = function( datasetId ) {
        return this.dataset_url + 'dataset/' + datasetId;
    };

    this.getURLForResources = function( datasetId ) {
        return this.dataset_url + 'dataset/' + datasetId;
    };

    this.getURLForOrganization = function( organisationId ) {
        return this.organization_url + 'organization/' + organisationId;
    };

    this.setCurrentLanguage = function(language) {
        this.currentLanguage = language;
    };

    // add bbounding box filter
    // add pagination

    this.getURLPaginated = function( startrow, numrow )
    {
        ret_url =  this.url;
        if ( this.bbox !== undefined )
        {
            ret_url += "ext_bbox=" //-104,17,-18,63
            ret_url += this.bbox[0].toString() + "," + this.bbox[1].toString() + "," + this.bbox[2].toString() + "," + this.bbox[3].toString();
            ret_url += "&"
        }
        ret_url +=  'q=';
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
        ret_url =  this.url;
        if ( this.bbox !== undefined )
        {
            ret_url += "ext_bbox=" //-104,17,-18,63
            ret_url += this.bbox[0].toString() + "," + this.bbox[1].toString() + "," + this.bbox[2].toString() + "," + this.bbox[3].toString();
            ret_url += "&"
        }
        ret_url +=  'rows=20&q=';

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


    this.getVaraibleIcon = function (name) 
    {
        //look for viable of name
        ret_thumb = undefined;
        return ret_thumb;
    };

    this.getVariableThumbnail = function(name)
    {
        ret = undefined;
        this.varriables.forEach( function(v)
        {
            if (v["ckantext"] == name)
            {
                ret = v["icon"]
            }
        }); 
        return ret;
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


function getCenterOfCoordinates( coords )
{
    x = 0;
    y = 0;
    if ( coords.length == 5 )
    {
        // rectangle!
        x = (coords[0][0] + coords[1][0] + coords[2][0] + coords[3][0] ) / 4;
        y = (coords[0][1] + coords[1][1] + coords[2][1] + coords[3][1] ) / 4;
    }
    return [x, y];
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
            feature.setId(r['id']);
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            feature.set('id', r['id']);
             // if multi polygone, will only see first. base on rectangle for now
            feature.set('center', getCenterOfCoordinates(objspatial['coordinates'][0]));
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
            feature.setId(r['id']);
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            feature.set('id', r['id']);
            // if multi polygone, will only see first. base on rectangle for now
            feature.set('center', getCenterOfCoordinates(objspatial['coordinates'][0]));
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


function getVariableForDatataset(dataset)
{
    ret_html = ""
    // Use tag to identify variable available. Temporary solution
    if (dataset['keywords'] !== undefined )
    {
        // open canada keywords
        // go through all keyword abs check if variable fit
        dataset['keywords']["en"].forEach( function(entry){
            // need to optimse with dictionary
            thumb =  ckan_server.getVariableThumbnail(entry);
            if ( thumb !== undefined )
            {
                ret_html += "<img src='" + "/asset/images/thumbnails/" + thumb + "'></img>";
            }
        });
    }
    else if ( dataset['tags'] !== undefined )
    {
        // slgo tags
        // go through all keyword tags check if variable fit
        dataset['tags'].forEach( function(entry){
            // need to optimse with dictionary
            thumb =  ckan_server.getVariableThumbnail(entry["name"]);
            if ( thumb !== undefined )
            {
                ret_html += "<img src='" + "/asset/images/thumbnails/" + thumb + "'></img>";
            }
        });
    }
    return ret_html;
}


function getToolForDataset(dataset)
{
    // Use resources to identify tool available. Temporary solution
    // should be possible to detect ERDAPP, OCTO or other link to tools
    ret_html = ""
    dataset['resources'].forEach( function(entry)
    {
        if ( entry['format'] == 'PDF')
        {
           // add PDF with link
           ret_html += "<a href='" + entry['url'] + "' class='btn btn-info btn_sm' target='_blank' role='button'>PDF</a> "
        }
        else if ( entry['format'] == 'WMS')
        {
           // add PDF with link
           ret_html += "<a href='" + entry['url'] + "' class='btn btn-success btn_sm' target='_blank' role='button'>WMS</a> "
        }
        else if ( entry['format'] == 'CSV')
        {
           // add PDF with link
           ret_html += "<a href='" + entry['url'] + "' class='btn btn-secondary btn_sm' target='_blank' role='button'>CSV</a> "
        }
    });
    return ret_html;
}



function generateDetailsPanel( dataset ) //, language, dataset_id, title, description, provider, link_url, prov_url)
{
    ret_html = "<div id='" + dataset["id"] + "' style='text-align: left;white-space:normal;' class='asset_details btn btn-light btn_sm');'>";
    ret_html += "<span class='details_label'>" + i18nStrings.getUIString("dataset_title") + "</span><br />";
    ret_html += "<span class=''details_text>" + i18nStrings.getTranslation(dataset['title_translated']) + "</span><br />";

    ret_html += '<a class="btn btn-primary" data-toggle="collapse" href="#' + dataset["id"] + '_collapse' + '" role="button">details</a><br />';

    ret_html += '<div class="collapse" id="' + dataset["id"] + '_collapse' + '">';
    ret_html += '<div class="card card-body">'
    ret_html += "<span class='details_label'>" + i18nStrings.getUIString("dataset_description") + "</span><br />";
    ret_html += "<span class=''details_text>" + i18nStrings.getTranslation(dataset['notes_translated']) + "</span><br />";
    ret_html += "<span class='details_label'>" + i18nStrings.getUIString("dataset_provider") + "</span><a href='" + ckan_server.getURLForOrganization(dataset['organization']['name']) + "'>up</a>";
    ret_html += "<span class=''details_text>" + dataset['organization']['title'] + "</span><br />";
    ret_html += "<span class='details_label'>" + i18nStrings.getUIString("dataset_tools") + "</span><br />";
    ret_html += "</div>";
    ret_html += "</div>";
    ret_html += '<button type="button" class="btn btn-primary btn_sm" onclick="selectFeatureOnMap(\'' + dataset["id"] + '\');");">Map</button> ';
    ret_html += '<a target="_blank" href="' +  ckan_server.getURLForDataset( dataset["id"] ) + '" class="btn btn-primary btn_sm" target="_blank" role="button">CKAN</a> ';
    ret_html += getToolForDataset(dataset);
    ret_html += "</div>";
    ret_html += "<div>"
    ret_html += getVariableForDatataset(dataset);
    ret_html += "</div>"
    return ret_html;
}



function DisplayCkanDatasetDetails(data)
{
    var html_dataset = "";
    var i = 0;
    var results = data['result']['results'];
    while ( i < results.length ) {
        var r = results[i];
        html_dataset += generateDetailsPanel( r );
        //"fr", r['id'], i18nStrings.getTranslation(r['title_translated']), i18nStrings.getTranslation(r['notes_translated']), r['organization']['title'], 'https://test-catalogue.ogsl.ca/dataset/', r['organization']['name']);
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
        html_dataset += generateDetailsPanel(  r );
        //['id'], i18nStrings.getTranslation(r['title_translated']), i18nStrings.getTranslation(r['notes_translated']), r['organization']['title'], 'https://test-catalogue.ogsl.ca/dataset/', r['organization']['name']);
        ++i;
    }
    document.getElementById('dataset_desc').innerHTML += html_dataset;
}


function displayTotalSearchDetails( total )
{
    stat_html = "<span class='stat_count'>" + total.toString() + "</span><br />";
    stat_html += "<span class='more_info_in'>" + i18nStrings.getUIString("more_data_catalog") + "</span><br />";
    stat_html += "<a class='btn btn-info btn-sm' target='_blank' href='" + ckan_server.getHomeCatalogURL() +"'>" + i18nStrings.getUIString("catalog") + "</a>";
    document.getElementById('dataset_search_stats').innerHTML = stat_html;
}

function displayCKANSearchDetails( data)
{
    displayTotalSearchDetails( data["result"]["count"])
}

function addAndDisplaydataset(data)
{
    AddToDisplayCkanDatasetDetails(data);
    AddDisplayCKANExtent(data);
}

function searchAndDisplayDataset(data)
{
    // call create map layer, description panel and stats
    displayCKANSearchDetails(data);
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
    displayTotalSearchDetails( 0);
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