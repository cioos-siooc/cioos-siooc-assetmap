var lg = null;
var ui_str = null;
var ckan_server = "pacific";
var i18nStrings = null;
var filters = null;
var mapconfig = null;
var wordpresspath = "/wp-content/themes/cioos-siooc-wordpress-theme-master/asset/"

function displayDatasetSummary( )
{


}


function displayDatasetDescription()
{

}

function getSelectedVariable()
{

}


function generateVariableBox( vardata )
{
    ret_html = "<li>";
    ret_html += "<input class='variable-checkbox' style='' type='checkbox' id='" + vardata["id"] + "' ";
    if ( !vardata["enabled"])
    {
        ret_html += "disabled";
    }
    ret_html += " onclick='checkCKANData();'>";
    ret_html += "<label for='" + vardata["id"] + "'>" + "<img src='" + wordpresspath + "/images/icons/" + vardata["icon"] + "' />" + "<em>" + i18nStrings.getTranslation(vardata["label"]) + "</em>" + "</label>";
    ret_html += "</li>";
    return ret_html;
}




function generateCategoryButton( catData)
{
    ret_html = '<a id="' + category["id"] + '_link" href="#' + category["id"] + '_tab' + '" role="tab" onclick="toggleTab(event, this);">';
    ret_html += "<div class='category_cell_bg'>";
    ret_html += "<div class='category-icon'><img src='" + wordpresspath + "/images/icons/" + catData["icon"] + "' onclick=''></div>";
    ret_html += i18nStrings.getTranslation(catData["label"]);
    ret_html += "</div>";
    ret_html += "</a>";
    return ret_html;
}

function toggleTab(e, link)
/**
 * [enables and disables variables drawer]
 * @param  {[event]} e [event]
 * @param  {[object]} link [element]
 */

{
    e.preventDefault();
    let tab = jQuery(link).attr("href");
    if (!jQuery(tab).hasClass("active")) {
        jQuery(tab).addClass("active");
        jQuery(tab)
          .siblings()
          .removeClass("active");
          jQuery(tab).show();
    } else {
        jQuery(tab).hide();
        jQuery(tab).removeClass("active");
    }
}

function generateFilterCategories()
{
    // for each variable, create box with label and icon
    // add has a possible filter in the CKANServer
    c = 0;
    VarInnerHtml = "";
    CatInnerHtml = "";
    while( c < filters["Categories"].length )
    {
        category = filters["Categories"][c];
        CatInnerHtml += generateCategoryButton(category);
        VarInnerPanelHTML = '<div id=' + category["id"] + '_tab' + ' class="tab-pane" role="tabpanel"><ul class="variable-options">';
        v = 0;
        while( v < category["variables"].length)
        {
            VarInnerPanelHTML += generateVariableBox(category["variables"][v]);
            ckan_server.addVariable(category["variables"][v]);
            ++v;
        }

        VarInnerPanelHTML += "</ul></div>";
        VarInnerHtml += VarInnerPanelHTML;
        ++c;
    }
    document.getElementById('category_panel').innerHTML = CatInnerHtml;
    document.getElementById('variable_panel').innerHTML = VarInnerHtml;
}


// Debug methode, shouldn't be in the final 

function changeCurrentLanguage( newLanguage )
{
    // set CKAN current language
    ckan_server.setCurrentLanguage(newLanguage);

    // set i18n o language
    i18nStrings.setBaseLanguage(newLanguage);
    i18nStrings.setCurrentLanguage(newLanguage);

    
    // clear map and details
    clearAllDatasets();

    // reload filters
    generateFilterCategories();

    //
    
}

function changeCurrentCKAN( ckan_instance )
{

    ckan_server.ckan_proxy_name = ckan_instance.substring(0, ckan_instance.length - 5)
    // reload ckan option
    jQuery.ajax({
        url: "" + wordpresspath + "/resources/" + ckan_instance,
        dataType: 'json',
        async: false,
        success: function (data) {
            ckan_server.loadConfig(data);
            ckan_server.setCurrentLanguage(i18nStrings.baseLanguage);
            clearAllDatasets();
        },
        error: function (e) {
        }
    });

    jQuery.ajax({
        url: "" + wordpresspath + "/reload/" + ckan_instance,
        dataType: 'text',
        async: false,
        success: function (data) {
            console.log("Proxy reloaded");
        },
        error: function (e) {
        }
    });

}

function setBasicUserPassword( username, password)
{
    // set user and password to the current CKAN server
    ckan_server.setBasicAuthInfo(username, password);
}

function setTimeFilters( minDate, maxDate )
{
    if ( minDate !== undefined )
    {
        ckan_server.minDate = minDate;
    }
    else
    {
        ckan_server.minDate =undefined;
    }

    if ( maxDate !== undefined )
    {
        ckan_server.maxDate = maxDate;
    }
    else
    {
        ckan_server.maxDate = undefined;
    }
}

function setVerticalFilters( minVertical, maxVertical )
{
    if ( minVertical !== undefined )
    {
        ckan_server.minVertical = minVertical;
    }
    else
    {
        ckan_server.minVertical = undefined;
    }

    if ( maxVertical !== undefined )
    {
        ckan_server.maxVertical = maxVertical;
    }
    else
    {
        ckan_server.maxVertical = undefined;
    }
}




jQuery(document).ready(function () {
    ckan_server = new CKANServer();
    i18nStrings = new StringTranslator();
    jQuery.ajax({
            url: "" + wordpresspath + "/resources/ui_str.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            ui_str = data;
            i18nStrings.setUIStrings(ui_str);
            i18nStrings.setBaseLanguage("fr");
            i18nStrings.setCurrentLanguage("fr");
        },
        error: function (e) {
        }
    });

    initMapFromConfig
    jQuery.ajax({
            url: "" + wordpresspath + "/resources/map.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            initMapFromConfig(data);
            // init ckan server from data
        },
        error: function (e) {
        }
    });

    jQuery.ajax({
            url: "" + wordpresspath + "/resources/ckan.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            ckan_server.loadConfig(data);
            // init ckan server from data
        },
        error: function (e) {
        }
    });

    jQuery.ajax({
            url: "" + wordpresspath + "/resources/filters.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            filters = data;
            generateFilterCategories();
        },
        error: function (e) {
        }
    });
});