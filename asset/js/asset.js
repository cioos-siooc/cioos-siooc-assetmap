var lg = null;
var ui_str = null;
var ckan_server = null;
var i18nStrings = null;
var filters = null;
var mapconfig = null;

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
    ret_html += "<label for='" + vardata["id"] + "'>" + "<img src='/asset/images/" + vardata["icon"] + "' />" + i18nStrings.getTranslation(vardata["label"]) + "</label>";
    ret_html += "</li>";
    return ret_html;
}




function generateCategoryButton( catData)
{
    ret_html = '<a href="#' + category["id"] + '_tab' + '" data-toggle="tab" role="tab">';
    ret_html += "<div class='category_cell_bg'>";
    ret_html += "<div class='category-icon'><img src='/asset/images/" + catData["icon"] + "' onclick=''></div>";
    ret_html += i18nStrings.getTranslation(catData["label"]);
    ret_html += "</div>";
    ret_html += "</a>";
    return ret_html;
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

    // reload ckan option
    $.ajax({
        url: "/asset/resources/" + ckan_instance,
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

    $.ajax({
        url: "/reload/" + ckan_instance,
        dataType: 'text',
        async: false,
        success: function (data) {
            console.log("Proxy reloaded");
        },
        error: function (e) {
        }
    });

}

function setBasicUserPassword()
{
    // set user and password to the current CKAN server
}

$(document).ready(function () {
    ckan_server = new CKANServer();
    i18nStrings = new StringTranslator();
    $.ajax({
        url: "/asset/resources/ui_str_0_0_2.json",
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
    $.ajax({
        url: "/asset/resources/map.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            initMapFromConfig(data);
            // init ckan server from data
        },
        error: function (e) {
        }
    });

    $.ajax({
        url: "/asset/resources/ckan.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            ckan_server.loadConfig(data);
            // init ckan server from data
        },
        error: function (e) {
        }
    });

    $.ajax({
        url: "/asset/resources/filters.json",
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