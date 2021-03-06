import filters from "../resources/filters.json";
import {clearAllDatasets, checkCKANData} from "./asset_ckan";
import {ckan_server} from "./asset_entry";
import i18nStrings from "./asset_i18n";
import jQuery from "jquery";

window.jQuery = jQuery;

// export for others scripts to use
window.jQuery = jQuery;
window.toggleTab =  toggleTab


function displayDatasetSummary( )
{


}


function displayDatasetDescription()
{

}

function getSelectedVariable()
{

}
window.checkCKANData=checkCKANData;

function generateVariableBox( vardata )
{
    let ret_html = "<li>";
    ret_html += "<input class='variable-checkbox' style='' type='checkbox' id='" + vardata["id"] + "' ";
    if ( !vardata["enabled"])
    {
        ret_html += "disabled";
    }
    ret_html += " onclick='checkCKANData();'>";
    ret_html += "<label for='" + vardata["id"] + "'>" + `<img src='${ckan_server.imagesDir}/icons/` + vardata["icon"] + "' />" + "<em>" + i18nStrings.getTranslation(vardata["label"]) + "</em>" + "</label>";
    ret_html += "</li>";
    return ret_html;
}

function generateLocationBox( location )
{
    let ret_html = "<li>";
    ret_html += "<input class='variable-checkbox' style='' type='checkbox' id='" + location["id"] + "' ";
    if ( !location["enabled"])
    {
        ret_html += "disabled";
    }
    ret_html += " onclick='setLocationAndCheck("+ JSON.stringify(location["extent"]) +");'>";
    ret_html += "<label for='" + location["id"] + "'>" + i18nStrings.getTranslation(location["label"]) + "</label>";
    ret_html += "</li>";
    return ret_html;
}

function generateLocationsButton(locationData)
{
    let ret_html = '<a href="#locations_tab" role="tab" onclick="toggleTab(event, this);">';
    ret_html += "<div class='category_cell_bg'>";
    ret_html += i18nStrings.getTranslation({
        "en": "Locations",
        "fr": "Emplacements"
    });
    ret_html += "</div>";
    ret_html += "</a>";
    return ret_html;
}

function generateLocationCategories(locations)
{
  // for each variable, create box with label and icon
  // add has a possible filter in the CKANServer
  if ( locations['enabled'] === true)
  {
    let c = 0;
    let CatInnerHtml = generateLocationsButton();
    let VarInnerPanelHTML = '<div id="locations_tab" class="tab-pane" role="tabpanel"><ul class="variable-options">';
    while (c < locations['locations'].length) {
        let place = locations['locations'][c];
        VarInnerPanelHTML += generateLocationBox(place);
        ++c;
    }
    VarInnerPanelHTML += "</ul></div>";
    document.getElementById("category_panel").innerHTML += CatInnerHtml;
    document.getElementById("variable_panel").innerHTML += VarInnerPanelHTML;
    }
}

function generateCategoryButton( catData)
{ //  category["id"] is it supposed to be catData["id"] ?
    
    // let ret_html = '<a href="#' + category["id"] + '_tab' + '" role="tab" onclick="toggleTab(event, this);">';
    let ret_html = '<a href="#' + catData["id"] + '_tab' + '" role="tab" onclick="toggleTab(event, this);">';
    ret_html += "<div class='category_cell_bg'>";
    ret_html += `<div class='category-icon'><img src='${ckan_server.imagesDir}/icons/` + catData["icon"] + "' onclick=''></div>";
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
    let c = 0;
    let VarInnerHtml = "";
    let CatInnerHtml = "";
    while( c < filters["Categories"].length )
    {
        let category = filters["Categories"][c];
        CatInnerHtml += generateCategoryButton(category);
        let VarInnerPanelHTML = '<div id=' + category["id"] + '_tab' + ' class="tab-pane" role="tabpanel"><ul class="variable-options">';
        let v = 0;
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


export {ckan_server, setVerticalFilters, setTimeFilters, changeCurrentLanguage, generateLocationCategories, generateFilterCategories}