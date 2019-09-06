



function CKANServer()
{
    this.url = 'ckan';
    this.homeURl  = '';
    this.dataset_url = '';
    this.organization_url= '';
    this.varriables = [];

    // current language to display dataset and UI
    this.currentLanguage = "fr";

    // add current language code in the linked URL to dataset/resource/organization
    // so CKAN display the data ine the desired language
    this.add_language_url = false;

    // bounding box where datatset need to intersect with
    this.bbox = undefined;

    // call api via JSONP ( other site and not using proxy )
    this.usejsonp = true;

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

    // use fl in the query to limit the number of element return un the JSON
    this.restrict_json_return = false;

    this.loadConfig= function (config) {
        this.url = config["access_url"];
        this.homeUrl = config["base_url"];
        this.dataset_url = config["dataset_url"];
        this.organization_url = config["organization_url"];
        this.add_language_url = config["add_language_url"];
        this.usejsonp = config["usejsonp"];
        this.resultPageSize = config["page_size"];
        this.restrict_json_return = config["restrict_json_return"];
        if ( config["start_bbox"] !== undefined )
        {
            if ( config["start_bbox"].length == 4 )
            {
                this.bbox = config["start_bbox"]
            }
        }
    };

    this.getHomeCatalogURL = function() {
        ret = this.homeUrl;
        if (this.add_language_url)
        {
            ret += this.currentLanguage;
        }
        return ret;
    };

    this.getURLForDataset = function( datasetId ) {
        ret = this.dataset_url 
        if (this.add_language_url)
        {
            ret += this.currentLanguage + '/';
        }
        ret += 'dataset/' + datasetId;
        return ret;
    };

    this.getURLForResources = function( datasetId ) {
        ret = this.dataset_url 
        if (this.add_language_url)
        {
            ret += this.currentLanguage + '/';
        }
        ret +='dataset/' + datasetId;
        return ret;
    };

    this.getURLForOrganization = function( organisationId ) {
        ret = this.organization_url 
        if (this.add_language_url)
        {
            ret += this.currentLanguage + '/';
        }
        ret += 'organization/' + organisationId;
        return ret;
    };

    this.setCurrentLanguage = function(language) {
        this.currentLanguage = language;
    };

    // add bbounding box filter
    // add pagination

    this.addVariableToURLFilter = function( variable )
    {
        ret = variable["ckantext"].join()
        return ret;
    }

    this.getURLPaginated = function( startrow, numrow )
    {
        var ret_url =  this.url;
        if (this.usejsonp)
        {
            // add the package search
            ret_url += '3/action/package_search?'
        }
        if ( this.bbox !== undefined )
        {
            ret_url += "ext_bbox=" //-104,17,-18,63
            ret_url += this.bbox[0].toString() + "," + this.bbox[1].toString() + "," + this.bbox[2].toString() + "," + this.bbox[3].toString();
            ret_url += "&"
        }
        if ( this.restrict_json_return ) 
        {
            // add fl with desired element to be returned in the JSON
            // this feature required the latest version of CKAN and that the items desired are 
        }
        ret_url +=  'q=';
        var v=0;
        var nofilter = true;
        while( v < this.varriables.length)
        {
            // get element for variable
            varData = this.varriables[v];
            varItem = document.getElementById(varData["id"]);
            // if checked, add text to the filter
            if ( varItem.checked )
            {
                ret_url += this.addVariableToURLFilter( varData );
                if ( !nofilter )
                {
                    ret_url += ' + ';
                }
                nofilter = false;
            }
            ++v;
        }
        ret_url += '&rows=' + numrow.toString() + '&start=' + startrow.toString();
        if (this.usejsonp)
        {
            ret_url += '&callback=jsonpcallback'
        }
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
        var ret_url =  this.url;
        if (this.usejsonp)
        {
            // add the package search
            ret_url += '3/action/package_search?'
        }
        if ( this.bbox !== undefined )
        {
            ret_url += "ext_bbox=" //-104,17,-18,63
            ret_url += this.bbox[0].toString() + "," + this.bbox[1].toString() + "," + this.bbox[2].toString() + "," + this.bbox[3].toString();
            ret_url += "&"
        }
        if ( this.restrict_json_return ) 
        {
            // add fl with desired element to be returned in the JSON
            // this feature required the latest version of CKAN and that the items desired are 
        }
        ret_url +=  'rows=' + this.resultPageSize + '&q=';
        var nofilter = true;
        var v=0;
        while( v < this.varriables.length)
        {
            // get element for variable
            varData = this.varriables[v];
            varItem = document.getElementById(varData["id"]);
            // if checked, add text to the filter
            if ( varItem.checked )
            {
                ret_url += this.addVariableToURLFilter( varData );
                if ( !nofilter )
                {
                    ret_url += ' + ';
                }
                nofilter = false;
            }
            ++v;
        }
        if (this.usejsonp)
        {
            ret_url += '&callback=jsonpcallback'
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
           // Create geometry feature as polygone (rect extent)
           var feature = new ol.Feature({
            geometry: new ol.geom.Point(getCenterOfCoordinates(objspatial['coordinates'][0]))
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


function displayCKANClusterIcon( data )
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
            //new Feature(new Point(coordinates));
            var pointfeature = new ol.Feature({
                geometry: new ol.geom.Point(getCenterOfCoordinates(objspatial['coordinates'][0]))
            });
            pointfeature.setId(r['id']);
            pointfeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
            // set id to link to description panel
            pointfeature.set('id', r['id']);
            // if multi polygone, will only see first. base on rectangle for now
            features.push(pointfeature);
        }
        ++i;
    }
    // recreate layer 
    map.removeLayer(clusterLayer);

    clusterVectorSource = new ol.source.Vector({
        features: features
    });

    var clusterSource = new ol.source.Cluster({
        distance: clusterStyleConfig["distance"],
        source: clusterVectorSource
      });

    var styleCache = {};
    clusterLayer = new ol.layer.Vector({
        source: clusterSource,
        style: function(feature) {
          var featuresSize = feature.get('features')
          if ( featuresSize != undefined)
          {
            var size = feature.get('features').length;
            var style = styleCache[size];
            if (!style) {
                style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: clusterStyleConfig["circleradius"],
                    stroke: new ol.style.Stroke({
                    color: clusterStyleConfig["stroke_color"]
                    }),
                    fill: new ol.style.Fill({
                    color: clusterStyleConfig["fill_color"]
                    })
                }),
                text: new ol.style.Text({
                    text: size.toString(),
                    fill: new ol.style.Fill({
                    color: clusterStyleConfig["text_color"]
                    })
                })
                });
                styleCache[size] = style;
            }
          }
          return style;
        }
      });
    map.addLayer(clusterLayer);
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



function generateDetailsPanel( dataset ) //, language, dataset_id, title, description, provider, link_url, prov_url)
{
    ret_html = "<div id='" + dataset["id"] + "'class='asset_details');'>";
    ret_html += "<h3 class='details_label'>" + i18nStrings.getUIString("dataset_title") + "</h3>";
    ret_html += "<p class='details_text'>" + i18nStrings.getTranslation(dataset['title_translated']) + "</p>";
    ret_html += '<a target="_blank" href="' +  ckan_server.getURLForDataset( dataset["id"] ) + '" class="asset-link" target="_blank" role="button">CKAN</a> ';
    ret_html += getToolForDataset(dataset);
    ret_html += '<div class="asset-actions"><button type="button" class="button" onclick="selectFeatureOnMap(\'' + dataset["id"] + '\');");">Map</button> ';
    ret_html += '<a class="button" data-toggle="collapse" href="#' + dataset["id"] + '_collapse' + '" role="button">details</a></div>';

    ret_html += '<div class="collapse" id="' + dataset["id"] + '_collapse' + '">';
    ret_html += '<div class="card card-body">'
    ret_html += "<h4 class='details_label'>" + i18nStrings.getUIString("dataset_description") + "</h4>";
    ret_html += "<p class='details_text'>" + i18nStrings.getTranslation(dataset['notes_translated']) + "</p>";
    ret_html += "<p class='details_label'>" + i18nStrings.getUIString("dataset_provider") + "</p><a href='" + ckan_server.getURLForOrganization(dataset['organization']['name']) + "'>up</a>";
    ret_html += "<span class=''details_text>" + dataset['organization']['title'] + "</span><br />";
    ret_html += "<span class='details_label'>" + i18nStrings.getUIString("dataset_tools") + "</span><br />";
    ret_html += "</div>";
    ret_html += "</div>";
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


function displayTotalSearchDetails( total, paging )
{
    stat_html = "";
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
        totaldataset =  parseInt(data["result"]["count"]);
        if ( ckan_server.lastPagedDataIndex < totaldataset)
        {
            // continue paging
            displayTotalSearchDetails( data["result"]["count"], ckan_server.lastPagedDataIndex );
            // until the weird jquery jsonp bug is corrected, do it by hand!
            url_ckan = ckan_server.getURLPaginated( ckan_server.lastPagedDataIndex, ckan_server.resultPageSize);
            ckan_server.lastPagedDataIndex += ckan_server.resultPageSize;
            // request first page of dataset
            if ( ckan_server.usejsonp)
            {
                $.ajax({
                    url: url_ckan,
                    dataType: "text",
                    success: function( data )
                    {
                        // still ugly JSONP hack!!
                        endofstr = data.length - 16;
                        var resjson = data.substr(14, endofstr );
                        addAndDisplaydataset( JSON.parse(resjson));
                    }
                });
            }
            else
            {
                $.getJSON( url_ckan, addAndDisplaydataset );
            }
        }
        else
        {
            displayTotalSearchDetails( totaldataset, totaldataset );
        }
    }
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

function searchAndDisplayDataset(data)
{
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
    if ( totaldataset > ckan_server.resultPageSize )
    {
        ckan_server.lastPagedDataIndex = ckan_server.resultPageSize;
        displayTotalSearchDetails( totaldataset, ckan_server.lastPagedDataIndex );
        // until the weird jquery jsonp bug is corrected, do it by hand!
        url_ckan = ckan_server.getURLPaginated( ckan_server.resultPageSize, ckan_server.resultPageSize);
        ckan_server.lastPagedDataIndex += ckan_server.resultPageSize;
        // request first page of dataset
        if ( ckan_server.usejsonp)
        {
            $.ajax({
                url: url_ckan,
                dataType: "text",
                success: function( data )
                {
                    // ugly JSONP hack!
                    endofstr = data.length - 16;
                    var resjson = data.substr(14, endofstr );
                    addAndDisplaydataset( JSON.parse(resjson));
                }
            });
        }
        else
        {
            $.getJSON( url_ckan, addAndDisplaydataset );
        }
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
    map.removeLayer(clusterLayer);
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
    // update the current state of filters ( use to check for parelle paging of data)
    ckan_server.lastFilterChange += 1;
    // verify if filters are active, if not, remove all data and don't access the entire catalogue
    if ( ckan_server.hasActiveFilter() )
    {
        // use CKAN config to write call to package_search
        // url_ckan = ckan_server.writeURL();

        // support jsonp by hand since jquery bug with adding other parameters at then end for nothing ( other than the callback )

        //var datavalue = {"q": "patate", "callback": "jsonpcallback"}
        var url_ckan = ckan_server.writeURL();
        // until the weird jquery jsonp bug is corrected, do it by hand!
        if ( ckan_server.usejsonp)
        {
            $.ajax({
                url: url_ckan,
                dataType: "text",
                success: function( data )
                {
                    endofstr = data.length - 16;
                    var resjson = data.substr(14, endofstr );
                    //console.log(resjson);
                    searchAndDisplayDataset( JSON.parse(resjson));
                    //console.log(data);
                }
            });
        }
        else
        {
            $.getJSON( url_ckan, searchAndDisplayDataset );
        }
        // request first page of dataset
        // $.getJSON( url_ckan, searchAndDisplayDataset ).fail(function(jqXHR, textStatus, errorThrown) {
        //   console.log("error " + textStatus);
        //   console.log("incoming Text " + jqXHR.responseText);
        //});
    }
    else
    {
        // remove all info from layers
        clearAllDatasets();
    }
}