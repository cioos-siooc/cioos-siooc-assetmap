// UI generation code
// details panel


function addMapSelctionDropdown()
{
    // add the select object and the bottom left of the map div
    domstr = '<select id="sel_asset_base_layer" onchange="asset_change_base_layer();">';
    // for all base layer in the config, add the option
    for ( let key in bacground_layers)
    {
        let basel = bacground_layers[key];
        domstr += '<option value="' + key + '>' + i18nStrings.getTranslation(basel["label"]) + '</option>';
    }
    domstr += '</select>';
    // append to the div map
}