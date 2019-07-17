var lg = null;
var ui_str = null;
var ckan_server = null;
var filters = null;

function displayDatasetSummary( )
{


}


function displayDatasetDescription()
{

}

function getSelectedVariable()
{

}

function generateVariableBox( vardata, language )
{
    ret_html = "<div class='variable_cell_bg'>";
    ret_html += "<img src='/asset/images/" + vardata["icon"] + "'><br />";
    ret_html += "<input style='' type='checkbox' id='" + vardata["id"] + "' ";
    if ( !vardata["enabled"])
    {
        ret_html += "disabled";
    }
    ret_html += " onclick='checkCKANData();'>";
    ret_html += "<label for='" + vardata["id"] + "'>" + vardata["label"][language] + "</label>";
    ret_html += "</div>";
    return ret_html;
}

function generateCategoryButton( catData, language)
{
    ret_html = "<div class='category_cell_bg'>";
    ret_html += "<img src='/asset/images/" + catData["icon"] + "'><br />";
    ret_html += "<span>" + catData["label"][language] + "</span>";
    ret_html += "</div>";
    return ret_html;
}

function generateFilterCategories( language )
{
    // for each variable, create box with label and icon
    // add has a possible filter in the CKANServer
    c = 0;
    VarInnerHtml = "";
    CatInnerHtml = "";
    while( c < filters["Categories"].length )
    {
        category = filters["Categories"][c];
        CatInnerHtml += generateCategoryButton(category, language);
        v = 0;
        while( v < category["variables"].length)
        {
            VarInnerHtml += generateVariableBox(category["variables"][v], language);
            ckan_server.addVariable(category["variables"][v]);
            ++v;
        }
        ++c;
    }
    document.getElementById('category_panel').innerHTML = CatInnerHtml;
    document.getElementById('variable_panel').innerHTML = VarInnerHtml;
}

$(document).ready(function () {
    ckan_server = new CKANServer();
    $.ajax({
        url: "/asset/resources/ui_str_0_0_2.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            ui_str = data;
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
        url: "/asset/resources/filters_0_0_2.json",
        dataType: 'json',
        async: false,
        success: function (data) {
            filters = data;
            generateFilterCategories("fr");
        },
        error: function (e) {
        }
    });
});