import filters from "../resources/filters.json";
import {clearAllDatasets, checkCKANData} from "./asset_ckan";
import {ckan_server} from "./asset_entry";
import i18nStrings from "./asset_i18n";
import jQuery from "jquery";

// export for others scripts to use
window.jQuery = jQuery;
window.toggleTab =  toggleTab
window.toggleCategoriAndCheckData =  toggleCategoriAndCheckData

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
    ret_html += " onclick='toggleCategoriAndCheckData();'";
    if ( vardata["default"])
    {
        ret_html += "checked";
    }
    ret_html += ">";
    ret_html += "<label for='" + vardata["id"] + "'>" + "<img src='./images/icons/" + vardata["icon"] + "' />" + "<em>" + i18nStrings.getTranslation(vardata["label"]) + "</em>" + "</label>";
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
{
    let ret_html = '<a href="#' + catData["id"] + '_tab' + '" role="tab" onclick="toggleTab(event, this);">';
    ret_html += "<div id='" +  catData["id"] +"_div' class='category_cell_bg'>";
    ret_html += "<div class='category-icon'><img src='./images/icons/" + catData["icon"] + "' onclick=''></div>";
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
        jQuery(link).children().addClass('activeCat')
        jQuery(tab)
          .siblings()
          .removeClass("active");
        jQuery(link).siblings().children().removeClass('activeCat')
        jQuery(tab).show();
    } else {
        jQuery(tab).hide();
        jQuery(tab).removeClass("active");
        jQuery(link).children().removeClass('activeCat')
    }
}

function toggleCategoriAndCheckData()
{
    // for each category, check if a varaible is seledted, if so highlit the category
    let c = 0;
    while( c < filters["Categories"].length )
    {
        let category = filters["Categories"][c];
        let cathasselction = false;
        let v = 0;
        let selection = 0;
        while( v < category["variables"].length)
        {
            while( v < category["variables"].length)
            {
                let catvar = category["variables"][v]
                if (  document.getElementById(catvar["id"]).checked == true )
                {
                    cathasselction = true;
                    selection++;
                }
                ++v;
            }
            ++c;
        }
        let elem = jQuery('#' + category["id"] + '_div')
        if(jQuery('#' + category["id"] + '_div > #nbSelection'))
        {
            jQuery('#' + category["id"] + '_div > #nbSelection').remove();
            elem.append("<span id='nbSelection'>" + selection + "/" + v + "</span>")
        }
        else {
            elem.append("<span id='nbSelection'>" + selection + "/" + v + "</span>")
        }

        if ( cathasselction == true)
        {
            let elem = jQuery('#' + category["id"] + '_div')
            if ( elem.hasClass("category_cell_bg")) {
                elem.removeClass("category_cell_bg");
                elem.addClass("category_cell_bg_highlited");
            }
        }
        else
        {   
            let elem = jQuery('#' + category["id"] + '_div')
            if ( elem.hasClass("category_cell_bg_highlited")) {
                elem.removeClass("category_cell_bg_highlited");
                elem.addClass("category_cell_bg");
            }
        }
    }
    checkCKANData();
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
    toggleCategoriAndCheckData();
}

function updateHeaderLanguage(newLanguage)
{
    // update header logo

    // update language bouton
    if ( newLanguage === "en" )
    {
        document.getElementById("headerImg").href = "//cioos.ca";
        document.getElementById("headerimgsrc").src = "images/cioos_banner_en-1.png";
        document.getElementById('headerTranslation').innerHTML = "FR";
        document.getElementById('headerTranslation').href = '//' + location.host + location.pathname + "?lg=fr";
        document.getElementById("app_title").innerHTML = "AssetMap";
        document.getElementById("titleAbout").innerHTML = "About the AssetMap";
        document.getElementById("descAbout").innerHTML = "The AssetMap is a data exploratory tool allow to see CIOOS Catalogue entries on a map, with the possibiliy to filter by ocean variables* such as Sea temperature or Phytoplankton. Data points and their geospatial extend are clickable, opening the side panel with the dataset information (title, description, data provider, and links to the Catalogue entry and data files).<br><br>" +
        "Filtering capacities are limited to EOVs allow discoverability of a wide range of ocean variables and data formats. To make your data discoverable through CIOOS, contact us at <a href = 'mailto:info@cioos.ca'>info@cioos.ca</a>!<br><br>" + 
        "Development of the AssetMap is ongoing, and our priority is to improve it to fit your needs. As such, your feedback is very important to us. Click below to reach our Feedback Form.<br><br>" +
        "<div id='feedbackAbout'><a href='https://forms.gle/RAdwYRZKBoXG49mr7' class='button'>Feedback</a></div><br><br>" +
        "* Essential Ocean Variables or EOVs are identified and described by the Expert Panels of the Global Ocean Observing System (GOOS).";
    }
    else
    {
        document.getElementById("headerImg").href = "//siooc.ca";
        document.getElementById("headerimgsrc").src = "images/siooc_banner_fr-1.png";
        document.getElementById('headerTranslation').innerHTML = "EN";
        document.getElementById('headerTranslation').href = '//' + location.host + location.pathname +  "?lg=en";
        document.getElementById("app_title").innerHTML = "AssetMap";
        document.getElementById("titleAbout").innerHTML = "À propos de l'AssetMap";
        document.getElementById("descAbout").innerHTML = "Le AssetMap est un outil d'exploration de données qui permet d'afficher les entrées du Catalogue de données du SIOOC sur une carte, avec la possibilité de filtrer les résultats par variable océaniques* telles que la température de surface de l'eau ou le phytoplancton.<br><br>" +
        "En cliquant sur les points de données et leur étendue géospatiale, le panneau latéral affiche les informations du jeu de données (titre, description, producteur de donnée et liens pour la page du Catalogue et les fichiers de données).<br><br>" + 
        "L'amélioration continue du AssetMap repose sur vos besoins. Vos commentaires et suggestions d'amélioration sont donc très importants pour nous. Cliquez ci-dessous pour accéder à notre formulaire de commentaires.<br><br>" +
        "<div id='feedbackAbout'><a href='https://forms.gle/Z8cQEqomHjjMU94bA' class='button'>Commentaires</a></div><br><br>" +
        "* Les variables océaniques essentielles (VOE) sont identifiées et décrites par les panels d'experts du (mettre en italique)Global Ocean Observing System (GOOS).";
    }
}


function changeCurrentLanguage( newLanguage )
{
    updateHeaderLanguage(newLanguage)
    // set CKAN current language
    ckan_server.setCurrentLanguage(newLanguage);

    // set i18n o language
    i18nStrings.setBaseLanguage(newLanguage);
    i18nStrings.setCurrentLanguage(newLanguage);

    // clear map and details
    clearAllDatasets();

    // reload filters
    generateFilterCategories();

    setDatasetDescriptionheader();
    
}

function setDatasetDescriptionheader()
{
    let decelem = document.getElementById("hideshow_desc");
    decelem.innerHTML = i18nStrings.getUIString("datasets_panel_title");
    decelem.innerHTML += '<span class="subtoggle">'
        + '<svg id="chevronDown" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">'
        + '<path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>'
        + '</svg>'
        + '<svg id="chevronUp" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">'
        + '<path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>'
        + '</svg>'
        + '</span>'
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


export {ckan_server, setVerticalFilters, setTimeFilters, updateHeaderLanguage, changeCurrentLanguage, generateLocationCategories, toggleCategoriAndCheckData, generateFilterCategories, setDatasetDescriptionheader}